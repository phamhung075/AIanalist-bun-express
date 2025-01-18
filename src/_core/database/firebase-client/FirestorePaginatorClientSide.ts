
import { FilterCondition, OrderByOption, PaginatedResult, PaginationOptions } from "@/_core/helper/interfaces/PaginationClient.interface";
import { WhereFilterOp } from "firebase-admin/firestore";
import { FirebaseError } from "firebase/app";
import {
    DocumentData,
    Query,
    QueryConstraint,
    QuerySnapshot,
    Timestamp,
    and,
    limit as fsLimit,
    orderBy as fsOrderBy,
    getCountFromServer,
    getDocs,
    or,
    query,
    startAfter,
    where
} from "firebase/firestore";

export class FirestorePaginator<T extends { id: string }> {
  private collection: Query<DocumentData>;

  constructor(private readonly collectionRef: Query<DocumentData>) {
    this.collection = collectionRef;
  }

  /**
   * Enhanced paginator with support for all PaginationOptions
   */
  async paginate(options: PaginationOptions): Promise<PaginatedResult<T>> {
    const startTime = Date.now();

    try {
      // Normalize options with defaults
      const {
        page = 1,
        limit = 10,
        filters = [],
        compositeFilters = [],
        lastVisible,
        orderBy,
        select,
        dateRange,
        includeSoftDeleted = false,
        all = false,
      } = options;

      // Build the query
      let baseQuery = this.collection;

      // Apply regular filters
      if (filters.length > 0) {
        try {
          baseQuery = this.applyFilters(baseQuery, filters);
        } catch (error) {
          // Propagate validation errors directly instead of wrapping them
          throw error;
        }
      }

      // Apply composite filters
      if (compositeFilters.length > 0) {
        try {
          baseQuery = this.applyCompositeFilters(baseQuery, compositeFilters);
        } catch (error) {
          // Propagate validation errors directly
          throw error;
        }
      }

      // Apply date range if specified
      if (dateRange) {
        baseQuery = this.applyDateRange(baseQuery, dateRange);
      }

      // Apply soft delete filter unless explicitly included
      if (!includeSoftDeleted) {
        baseQuery = query(baseQuery, where("deletedAt", "==", null));
      }

      // Apply sorting
      if (orderBy) {
        baseQuery = this.applySorting(baseQuery, orderBy);
      }

      // Apply pagination unless fetching all
      if (!all) {
        if (lastVisible) {
          baseQuery = query(baseQuery, startAfter(lastVisible));
        }
        baseQuery = query(baseQuery, fsLimit(limit));
      }

      // Execute query
      const [snapshot, totalSnapshot] = await Promise.all([
        getDocs(baseQuery),
        getCountFromServer(this.collection),
      ]);

      // Process results
      const data = this.processQuerySnapshot(snapshot, select);
      const total = totalSnapshot.data().count;
      const totalPages = Math.ceil(total / limit);

      // Prepare result
      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        lastVisible: snapshot.docs[snapshot.docs.length - 1],
        executionTime: Date.now() - startTime,
        appliedFilters: {
          filters: this.normalizeFilters(filters),
          dateRange: dateRange
            ? {
                field: dateRange.field,
                start: dateRange.start,
                end: dateRange.end,
              }
            : undefined,
          orderBy: this.normalizeOrderBy(orderBy),
        },
      };
    } catch (error) {
        // Only wrap non-validation errors
        if (error instanceof FirebaseError) {
          return this.handleError(error, 'Failed to paginate documents');
        }
        // Propagate validation errors directly
        throw error;
      }
  }

  private validateFilterValue(filter: FilterCondition): void {
    // Check for null/undefined values
    if (filter.value === null || filter.value === undefined) {
      throw new Error(`Invalid filter value: ${filter.key} cannot have null or undefined value`);
    }
    
    // Validate array-contains operator
    if (filter.operator === 'array-contains' && Array.isArray(filter.value)) {
      throw new Error(`Invalid filter value: array-contains operator cannot be used with an array value`);
    }
    
    // Validate array operators
    if (['in', 'not-in'].includes(filter.operator)) {
      if (!Array.isArray(filter.value)) {
        throw new Error(`Invalid filter value: ${filter.operator} operator requires an array value`);
      }
      if (filter.value.length === 0) {
        throw new Error(`Invalid filter value: ${filter.operator} operator requires a non-empty array`);
      }
    }
  }

  /**
   * Apply regular filters to query with value validation
   */
  private applyFilters(
    baseQuery: Query<DocumentData>,
    filters: FilterCondition[]
  ): Query<DocumentData> {
    if (!filters.length) return baseQuery;

    const conditions = filters.map((filter) => {
      // Validate filter value before applying
      this.validateFilterValue(filter);

      const value =
        filter.value instanceof Date
          ? Timestamp.fromDate(filter.value)
          : filter.value;
      return where(filter.key, filter.operator as WhereFilterOp, value);
    });

    return query(baseQuery, ...conditions);
  }

  /**
   * Apply composite filters (AND/OR combinations)
   */
  private applyCompositeFilters(
    baseQuery: Query<DocumentData>,
    compositeFilters: { type: "and" | "or"; conditions: FilterCondition[] }[]
  ): Query<DocumentData> {
    if (!compositeFilters.length) return baseQuery;

    const filters = compositeFilters.map((group) => {
      const conditions = group.conditions.map((condition) => {
        // Validate filter value before applying
        this.validateFilterValue(condition);

        const value =
          condition.value instanceof Date
            ? Timestamp.fromDate(condition.value)
            : condition.value;
        return where(condition.key, condition.operator as WhereFilterOp, value);
      });

      return group.type === "or" ? or(...conditions) : and(...conditions);
    });

    return query(baseQuery, and(...filters));
  }

  /**
   * Apply date range filter
   */
  private applyDateRange(
    baseQuery: Query<DocumentData>,
    dateRange: { field: string; start?: Date; end?: Date }
  ): Query<DocumentData> {
    const conditions: QueryConstraint[] = [];

    if (dateRange.start) {
      conditions.push(
        where(dateRange.field, ">=", Timestamp.fromDate(dateRange.start))
      );
    }

    if (dateRange.end) {
      conditions.push(
        where(dateRange.field, "<=", Timestamp.fromDate(dateRange.end))
      );
    }

    return conditions.length ? query(baseQuery, ...conditions) : baseQuery;
  }

  /**
   * Apply sorting options
   */
  private applySorting(
    baseQuery: Query<DocumentData>,
    orderBy: OrderByOption | OrderByOption[]
  ): Query<DocumentData> {
    const orderByOptions = Array.isArray(orderBy) ? orderBy : [orderBy];

    return query(
      baseQuery,
      ...orderByOptions.map((option) =>
        fsOrderBy(option.field, option.direction || "asc")
      )
    );
  }

  /**
   * Process query snapshot and apply field selection
   */
  private processQuerySnapshot(
    snapshot: QuerySnapshot<DocumentData>,
    select?: string[]
  ): T[] {
    return snapshot.docs.map((doc) => {
      const data = doc.data();

      if (select?.length) {
        return select.reduce(
          (obj, field) => {
            obj[field] = data[field];
            return obj;
          },
          { id: doc.id } as any
        );
      }

      return {
        id: doc.id,
        ...data,
      } as T;
    });
  }

  /**
   * Normalize filters for response
   */
  private normalizeFilters(
    filters: FilterCondition[]
  ): Record<string, unknown> {
    return filters.reduce(
      (acc: Record<string, unknown>, filter: FilterCondition) => {
        acc[filter.key.toString()] = filter.value;
        return acc;
      },
      {}
    );
  }

  /**
   * Normalize composite filters for response
   */
  private normalizeCompositeFilters(
    compositeFilters: { type: "and" | "or"; conditions: FilterCondition[] }[]
  ): { type: string; conditions: Record<string, any>[] }[] {
    return compositeFilters.map((group) => ({
      type: group.type,
      conditions: group.conditions.map((condition) => ({
        [condition.key.toString()]: condition.value,
      })),
    }));
  }

  /**
   * Normalize orderBy for response
   */
  private normalizeOrderBy(
    orderBy?: OrderByOption | OrderByOption[]
  ): Record<string, "asc" | "desc"> {
    if (!orderBy) return {};

    const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
    return orders.reduce((acc: Record<string, "asc" | "desc">, order) => {
      acc[order.field] = order.direction || "asc";
      return acc;
    }, {} as Record<string, "asc" | "desc">);
  }


  /**
   * Enhanced error handling
   */
  private handleError(error: FirebaseError, defaultMessage: string): never {
    console.error('❌ Firestore Error:', error);

    switch (error.code) {
      case 'permission-denied':
        throw new Error('Permission denied');
      case 'not-found':
        throw new Error('Resource not found');
      case 'resource-exhausted':
        throw new Error('Query quota exceeded');
      case 'failed-precondition':
        throw new Error('Query requires an index');
      default:
        throw new Error(error.message || defaultMessage);
    }
  }
}

// // Usage example:
// /*
//   const paginator = new FirestorePaginator<UserDocument>(
//     collection(db, 'users')
//   );
  
//   const result = await paginator.paginate({
//     page: 1,
//     limit: 10,
//     filters: [
//       { key: 'status', operator: '==', value: 'active' }
//     ],
//     orderBy: { field: 'createdAt', direction: 'desc' },
//     dateRange: {
//       field: 'createdAt',
//       start: new Date('2024-01-01'),
//       end: new Date()
//     }
//   });
//   */
