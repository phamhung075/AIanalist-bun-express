
import { FilterCondition, OrderByOption, PaginatedResult, PaginationOptions } from "@/_core/helper/interfaces/PaginationServer.interface";
import { 
    CollectionReference,
    DocumentData, 
    FieldPath, 
    OrderByDirection, 
    Query,
    QuerySnapshot,
    Timestamp,
} from "firebase-admin/firestore";

export class FirestorePaginator<T extends { id: string }> {
    private collection: CollectionReference<DocumentData> | Query<DocumentData>;

    constructor(collectionRef: CollectionReference<DocumentData> | Query<DocumentData>) {
        this.collection = collectionRef;
    }

    async paginate(options: PaginationOptions): Promise<PaginatedResult<T>> {
        const startTime = Date.now();

        try {
            const {
                page = 1,
                limit: limitSize = 10,
                filters = [],
                compositeFilters = [],
                lastVisible,
                orderBy: orderByOption,
                select,
                dateRange,
                includeSoftDeleted = false,
                all = false,
            } = options;

            // Build query with all filters
            let baseQuery = this.buildFilteredQuery(
                this.collection,
                filters,
                compositeFilters,
                dateRange,
                includeSoftDeleted
            );

            // Create a separate query for count that includes the same filters
            let countQuery = this.buildFilteredQuery(
                this.collection,
                filters,
                compositeFilters,
                dateRange,
                includeSoftDeleted
            );

            // Apply sorting
            if (orderByOption) {
                baseQuery = this.applySorting(baseQuery, orderByOption);
            }

            // Apply pagination
            if (!all) {
                if (lastVisible) {
                    baseQuery = baseQuery.startAfter(lastVisible);
                }
                baseQuery = baseQuery.limit(limitSize);
            }

            // Execute query and get total count with filters
            const [snapshot, totalSnapshot] = await Promise.all([
                baseQuery.get(),
                countQuery.count().get()
            ]);

            const data = this.processQuerySnapshot(snapshot, select);
            const total = totalSnapshot.data().count;
            const totalPages = Math.ceil(total / limitSize);

            return {
                data,
                total,
                page,
                limit: limitSize,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                lastVisible: snapshot.docs[snapshot.docs.length - 1],
                executionTime: Date.now() - startTime,
                appliedFilters: {
                    filters: this.normalizeFilters(filters),
                    dateRange: dateRange
                        ? {
                            field: dateRange.field.toString(),
                            start: dateRange.start,
                            end: dateRange.end,
                        }
                        : undefined,
                    orderBy: this.normalizeOrderBy(orderByOption),
                },
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to paginate documents: ${error.message}`);
            }
            throw new Error('Failed to paginate documents');
        }
    }

    private buildFilteredQuery(
        baseQuery: CollectionReference<DocumentData> | Query<DocumentData>,
        filters: FilterCondition[],
        compositeFilters: { type: "and" | "or"; conditions: FilterCondition[] }[],
        dateRange?: { field: string | FieldPath; start?: Date; end?: Date },
        includeSoftDeleted: boolean = false
    ): Query<DocumentData> {
        let query = baseQuery;

        // Apply basic filters
        if (filters.length > 0) {
            query = this.applyFilters(query, filters);
        }

        // Apply composite filters
        if (compositeFilters.length > 0) {
            query = this.applyCompositeFilters(query, compositeFilters);
        }

        // Apply date range
        if (dateRange) {
            query = this.applyDateRange(query, dateRange);
        }

        // Apply soft delete filter
        if (!includeSoftDeleted) {
            query = query.where("deletedAt", "==", null);
        }

        return query;
    }

    private validateFilterValue(filter: FilterCondition): void {
        if (filter.value === null || filter.value === undefined) {
            throw new Error(`Invalid filter value: ${filter.key} cannot have null or undefined value`);
        }
        
        if (filter.operator === 'array-contains' && Array.isArray(filter.value)) {
            throw new Error(`Invalid filter value: array-contains operator cannot be used with an array value`);
        }
        
        if (['in', 'not-in', 'array-contains-any'].includes(filter.operator)) {
            if (!Array.isArray(filter.value)) {
                throw new Error(`Invalid filter value: ${filter.operator} operator requires an array value`);
            }
            if (filter.value.length === 0) {
                throw new Error(`Invalid filter value: ${filter.operator} operator requires a non-empty array`);
            }
            if (filter.value.length > 10) {
                throw new Error(`Invalid filter value: ${filter.operator} operator is limited to 10 values`);
            }
        }
    }

    private applyFilters(
        baseQuery: CollectionReference<DocumentData> | Query<DocumentData>,
        filters: FilterCondition[]
    ): Query<DocumentData> {
        if (!filters.length) return baseQuery;

        let query = baseQuery;
        for (const filter of filters) {
            this.validateFilterValue(filter);

            const value = filter.value instanceof Date
                ? Timestamp.fromDate(filter.value)
                : filter.value;
            
            query = query.where(filter.key, filter.operator, value);
        }

        return query;
    }

    private applyCompositeFilters(
        baseQuery: CollectionReference<DocumentData> | Query<DocumentData>,
        compositeFilters: { type: "and" | "or"; conditions: FilterCondition[] }[]
    ): Query<DocumentData> {
        if (!compositeFilters.length) return baseQuery;

        let query = baseQuery;
        
        for (const group of compositeFilters) {
            if (group.type === "or") {
                console.warn("OR operations are not directly supported in Firebase Admin SDK");
                continue;
            }

            for (const condition of group.conditions) {
                this.validateFilterValue(condition);

                const value = condition.value instanceof Date
                    ? Timestamp.fromDate(condition.value)
                    : condition.value;
                
                query = query.where(condition.key, condition.operator, value);
            }
        }

        return query;
    }

    private applyDateRange(
        baseQuery: CollectionReference<DocumentData> | Query<DocumentData>,
        dateRange: { field: string | FieldPath; start?: Date; end?: Date }
    ): Query<DocumentData> {
        let query = baseQuery;

        if (dateRange.start) {
            query = query.where(
                dateRange.field,
                ">=",
                Timestamp.fromDate(dateRange.start)
            );
        }

        if (dateRange.end) {
            query = query.where(
                dateRange.field,
                "<=",
                Timestamp.fromDate(dateRange.end)
            );
        }

        return query;
    }

    private applySorting(
        baseQuery: CollectionReference<DocumentData> | Query<DocumentData>,
        orderByOption: OrderByOption | OrderByOption[]
    ): Query<DocumentData> {
        const orderByOptions = Array.isArray(orderByOption) ? orderByOption : [orderByOption];
        let query = baseQuery;

        for (const option of orderByOptions) {
            query = query.orderBy(option.field, option.direction || "asc");
        }

        return query;
    }

    private processQuerySnapshot(
        snapshot: QuerySnapshot,
        select?: Array<string | FieldPath>
    ): T[] {
        return snapshot.docs.map((doc) => {
            const data = doc.data();

            if (select?.length) {
                return select.reduce(
                    (obj, field) => {
                        const fieldStr = field.toString();
                        obj[fieldStr] = data[fieldStr];
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

    private normalizeOrderBy(
        orderByOption?: OrderByOption | OrderByOption[]
    ): Record<string, OrderByDirection> {
        if (!orderByOption) return {};

        const orders = Array.isArray(orderByOption) ? orderByOption : [orderByOption];
        return orders.reduce((acc: Record<string, OrderByDirection>, order) => {
            acc[order.field.toString()] = order.direction || "asc";
            return acc;
        }, {});
    }
}


// Usage example:
/*
const paginator = new FirestorePaginator<UserDocument>(
    admin.firestore().collection('users')
);

const result = await paginator.paginate({
    page: 1,
    limit: 10,
    filters: [
        { key: 'status', operator: '==', value: 'active' },
        { key: FieldPath.documentId(), operator: 'in', value: ['id1', 'id2'] }
    ],
    orderBy: { field: 'createdAt', direction: 'desc' },
    dateRange: {
        field: 'createdAt',
        start: new Date('2024-01-01'),
        end: new Date()
    }
});
*/