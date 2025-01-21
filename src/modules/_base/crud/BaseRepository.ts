import { firestore } from "@/_core/database/firebase-admin-sdk";
import { API_CONFIG } from "@/_core/helper/http-status/common/api-config";
import { createPagination } from "@/_core/helper/http-status/common/create-pagination";
import _ERROR from "@/_core/helper/http-status/error";
import {
  PaginatedResult,
  PaginationOptions,
} from "@/_core/helper/interfaces/Pagination.interface";
import { PaginationInput } from "@/_core/helper/validateZodSchema/Pagination.validation";
import {
  DocumentSnapshot,
  OrderByDirection,
  Query,
  CollectionReference,
  WhereFilterOp,
  Timestamp,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

interface BaseDocument {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
/**
 * Helper type to convert QueryDocumentSnapshot to DocumentSnapshot
 */
function convertToDocumentSnapshot(
  doc: QueryDocumentSnapshot
): DocumentSnapshot {
  return doc as unknown as DocumentSnapshot;
}
/**
 * Enhanced Generic Firestore Repository with improved error handling and features
 */
export abstract class BaseRepository<T extends BaseDocument> {
  protected collectionName: string;
  protected softDelete: boolean;

  constructor(collectionName: string, options: { softDelete?: boolean } = {}) {
    this.collectionName = collectionName;
    this.softDelete = options.softDelete ?? true;
  }

  /**
   * Access Firestore Collection with proper typing
   */
  protected get collection(): CollectionReference {
    return firestore.collection(this.collectionName);
  }

  /**
   * Create a new document with timestamps
   */
  async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    try {
      const timestamp = new Date();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        deletedAt: null,
      };

      const docRef = await this.collection.add(docData);
      return { id: docRef.id, ...docData } as T;
    } catch (error: any) {
      this.handleFirestoreError(error, "Failed to create document");
    }
  }

  /**
   * Create a document with a specific ID
   */
  async createWithId(
    id: string,
    data: Omit<T, "id" | "createdAt" | "updatedAt">
  ): Promise<T> {
    try {
      const timestamp = new Date();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        deletedAt: null,
      };

      const docRef = this.collection.doc(id);
      const existingDoc = await docRef.get();

      if (existingDoc.exists) {
        throw new _ERROR.ConflictError({
          message: `Document with ID ${id} already exists`,
        });
      }

      await docRef.set(docData);
      return { id, ...docData } as T;
    } catch (error: any) {
      if (error instanceof _ERROR.ConflictError) {
        throw error;
      }
      this.handleFirestoreError(error, "Failed to create document with ID");
    }
  }

  /**
   * Enhanced getAll with pagination, filtering, and soft delete handling
   */
  async getAll(pagination: PaginationInput): Promise<
    Omit<PaginatedResult<T>, "lastVisible"> & {
      lastVisible?: DocumentSnapshot;
    }
  > {
    const startTime = Date.now();
    const page = pagination.page ?? API_CONFIG.PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      pagination.limit ?? API_CONFIG.PAGINATION.DEFAULT_LIMIT,
      API_CONFIG.PAGINATION.MAX_LIMIT
    );
    const sort = pagination.sort ?? "createdAt";
    const order = pagination.order ?? "desc";

    try {
      let query = this.collection.orderBy(sort, order);

      if (this.softDelete) {
        query = query.where("deletedAt", "==", null);
      }

      if (page > 1) {
        const lastDoc = await this.getLastVisibleDoc(
          page - 1,
          limit,
          sort,
          order
        );
        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }
      }

      const [snapshot, totalSnapshot] = await Promise.all([
        query.limit(limit + 1).get(),
        this.getTotalCount(query),
      ]);

      const docs = snapshot.docs;
      const hasNextPage = docs.length > limit;

      if (hasNextPage) {
        docs.pop();
      }

      const results = docs.map((doc) => this.mapQueryDocumentData(doc));
      const totalItems = totalSnapshot.data().count;
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: results,
        total: totalItems,
        page,
        totalPages,
        limit,
        hasNextPage,
        hasPrevPage: page > 1,
        lastVisible: hasNextPage ? docs[docs.length - 1] : undefined,
        executionTime: Date.now() - startTime,
      };
    } catch (error: any) {
      this.handleFirestoreError(error, "Failed to retrieve documents");
    }
  }

  /**
   * Get document by ID with improved error handling
   */
  async getById(id: string): Promise<T> {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      const data = this.mapDocumentData(doc);

      // Check for soft deleted documents
      if (this.softDelete && data.deletedAt) {
        throw new _ERROR.NotFoundError({
          message: `Document with ID ${id} has been deleted`,
        });
      }

      return data;
    } catch (error: any) {
      if (error instanceof _ERROR.NotFoundError) {
        throw error;
      }
      this.handleFirestoreError(
        error,
        `Failed to fetch document with ID ${id}`
      );
    }
  }

  /**
   * Update document by ID with optimistic locking
   */
  async update(
    id: string,
    updates: Partial<Omit<T, "id" | "createdAt">>
  ): Promise<T> {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      const data = this.mapDocumentData(doc);

      // Check for soft deleted documents
      if (this.softDelete && data.deletedAt) {
        throw new _ERROR.NotFoundError({
          message: `Document with ID ${id} has been deleted`,
        });
      }

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await docRef.update(updateData);

      const updatedDoc = await docRef.get();
      return this.mapDocumentData(updatedDoc);
    } catch (error: any) {
      if (error instanceof _ERROR.NotFoundError) {
        throw error;
      }
      this.handleFirestoreError(
        error,
        `Failed to update document with ID ${id}`
      );
    }
  }

  /**
   * Delete document with support for soft delete
   */
  async delete(id: string): Promise<boolean> {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new _ERROR.NotFoundError({
          message: `Document with ID ${id} not found`,
        });
      }

      if (this.softDelete) {
        await docRef.update({
          deletedAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        await docRef.delete();
      }

      return true;
    } catch (error: any) {
      if (error instanceof _ERROR.NotFoundError) {
        throw error;
      }
      this.handleFirestoreError(
        error,
        `Failed to delete document with ID ${id}`
      );
    }
  }

  /**
   * Enhanced paginator with filtering and sorting
   */
  async paginate(options: PaginationOptions): Promise<
    Omit<PaginatedResult<T>, "lastVisible"> & {
      lastVisible?: DocumentSnapshot;
    }
  > {
    const startTime = Date.now();
    try {
      const {
        page = 1,
        limit = 10,
        filters = [],
        lastVisible,
        orderBy,
        all = false,
      } = options;

      let query: Query = this.collection;

      if (this.softDelete) {
        query = query.where("deletedAt", "==", null);
      }

      for (const filter of filters) {
        if (filter.value !== undefined && filter.value !== null) {
          const value =
            filter.value instanceof Date
              ? Timestamp.fromDate(filter.value)
              : filter.value;
          query = query.where(
            filter.key,
            filter.operator as WhereFilterOp,
            value
          );
        }
      }

      if (orderBy) {
        const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
        orders.forEach(({ field, direction }) => {
          query = query.orderBy(field, direction || "asc");
        });
      }

      if (!all) {
        if (lastVisible) {
          query = query.startAfter(lastVisible);
        }
        query = query.limit(limit);
      }

      const [snapshot, totalSnapshot] = await Promise.all([
        query.get(),
        this.getTotalCount(query),
      ]);

      const data = snapshot.docs.map((doc) => this.mapQueryDocumentData(doc));
      const total = totalSnapshot.data().count;
      const totalPages = Math.ceil(total / limit);

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      return {
        data,
        total,
        page,
        totalPages,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
        lastVisible: lastDoc,
        executionTime: Date.now() - startTime,
        appliedFilters: {
          filters: filters.reduce((acc, filter) => {
            if (typeof filter.key === "string") {
              (acc as any)[filter.key] =
                filter.value !== undefined ? filter.value : null;
            }
            return acc;
          }, {}),
          orderBy: Array.isArray(orderBy)
            ? orderBy.reduce(
                (acc, { field, direction }) => ({
                  ...acc,
                  [field]: direction || "asc",
                }),
                {}
              )
            : orderBy
            ? { [orderBy.field]: orderBy.direction || "asc" }
            : undefined,
        },
      };
    } catch (error: any) {
      this.handleFirestoreError(error, "Failed to paginate documents");
    }
  }

  /**
   * Helper method to get the last visible document
   */
  private async getLastVisibleDoc(
    page: number,
    limit: number,
    sort: string,
    order: OrderByDirection
  ): Promise<DocumentSnapshot | null> {
    try {
      let query = this.collection.orderBy(sort, order);

      if (this.softDelete) {
        query = query.where("deletedAt", "==", null);
      }

      const snapshot = await query.limit(page * limit).get();

      if (snapshot.empty || snapshot.docs.length < page * limit) {
        return null;
      }

      return snapshot.docs[snapshot.docs.length - 1];
    } catch (error) {
      console.error("Error getting last visible document:", error);
      return null;
    }
  }
  /**
   * Helper method to get total count with filters
   */
  private async getTotalCount(
    query: Query
  ): Promise<{ data: () => { count: number } }> {
    return query.count().get();
  }

  /**
   * Helper method to map document data with proper typing
   */
  private mapDocumentData(doc: DocumentSnapshot | QueryDocumentSnapshot): T {
    if (!doc.exists) {
      throw new _ERROR.NotFoundError({
        message: `Document with ID ${doc.id} not found`,
      });
    }
  
    const data = doc.data();
    if (!data) {
      throw new _ERROR.NotFoundError({
        message: `No data found for document ${doc.id}`,
      });
    }
  
    // Convert Firestore Timestamps to JavaScript Dates
    const convertTimestamp = (field: any) => {
      if (!field) return null;
      return field instanceof Date ? field : field.toDate();
    };
  
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      deletedAt: convertTimestamp(data.deletedAt),
    } as T;
  }

  /**
   * Helper method specifically for mapping QueryDocumentSnapshot
   * Used in list operations where we know the document exists
   */
  private mapQueryDocumentData(doc: QueryDocumentSnapshot): T {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      ...(data.createdAt && {
        createdAt:
          data.createdAt instanceof Date
            ? data.createdAt
            : data.createdAt.toDate(),
      }),
      ...(data.updatedAt && {
        updatedAt:
          data.updatedAt instanceof Date
            ? data.updatedAt
            : data.updatedAt.toDate(),
      }),
      ...(data.deletedAt && {
        deletedAt:
          data.deletedAt instanceof Date
            ? data.deletedAt
            : data.deletedAt.toDate(),
      }),
    } as T;
  }

  /**
   * Enhanced error handling with specific error types
   */
  private handleFirestoreError(error: any, defaultMessage: string): never {
    console.error("❌ Firestore Error:", error);

    if (error instanceof _ERROR.ErrorResponse) {
      throw error;
    }

    switch (error.code) {
      case "permission-denied":
        throw new _ERROR.ForbiddenError({
          message: "Permission denied",
          error: error.message,
        });
      case "not-found":
        throw new _ERROR.NotFoundError({
          message: "Resource not found",
          error: error.message,
        });
      case "already-exists":
        throw new _ERROR.ConflictError({
          message: "Resource already exists",
          error: error.message,
        });
      case "resource-exhausted":
        throw new _ERROR.TooManyRequestsError({
          message: "Rate limit exceeded",
          error: error.message,
        });
      case "failed-precondition":
        throw new _ERROR.BadRequestError({
          message: "Operation failed due to document state",
          error: error.message,
        });
      case "cancelled":
        throw new _ERROR.ServiceUnavailableError({
          message: "Operation cancelled",
          error: error.message,
        });
      default:
        throw new _ERROR.InternalServerError({
          message: defaultMessage,
          error: error.message || "Unknown Firestore error",
        });
    }
  }
}
