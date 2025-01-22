import { firestore } from "@/_core/database/firebase-admin-sdk";
import {
  CollectionReference,
  DocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";
import { PaginationOptions } from "@/_core/helper/interfaces/PaginationServer.interface";
import { FirestorePaginator } from "@/_core/database/firebase-admin-sdk/FirestorePaginatorServerSide";
import { PaginationInput } from "@/_core/helper/validateZodSchema/Pagination.validation";
import { PaginationResult } from "@/_core/helper/interfaces/rest.interface";

interface BaseDocument {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class BaseRepository<T extends BaseDocument> {
  protected collection: CollectionReference;
  protected paginator: FirestorePaginator<T & { id: string }>;
  protected softDelete: boolean;

  constructor(collectionName: string, options: { softDelete?: boolean } = {}) {
    this.collection = firestore.collection(collectionName);
    this.paginator = new FirestorePaginator<T & { id: string }>(
      this.collection
    );
    this.softDelete = options.softDelete ?? true;
  }

  async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    try {
      const timestamp = Timestamp.now();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        deletedAt: null,
      };

      const docRef = await this.collection.add(docData);
      const doc = await docRef.get();
      return this.mapDocumentData(doc);
    } catch (error) {
      throw this.handleError(error, "Failed to create document");
    }
  }

  async createWithId(
    id: string,
    data: Omit<T, "id" | "createdAt" | "updatedAt">
  ): Promise<T> {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      if (doc.exists) {
        throw new Error(`Document avec l'ID ${id} existe déjà`);
      }

      const timestamp = Timestamp.now();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        deletedAt: null,
      };

      await docRef.set(docData);
      return { id: docRef.id, ...docData } as unknown as T;
    } catch (error) {
      throw this.handleError(
        error,
        "Échec de la création du document avec un ID spécifique"
      );
    }
  }

  async getById(id: string): Promise<T> {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error(`Document with ID ${id} not found`);
      }

      const data = this.mapDocumentData(doc);

      if (this.softDelete && data.deletedAt) {
        throw new Error(`Document with ID ${id} has been deleted`);
      }

      return data;
    } catch (error) {
      throw this.handleError(error, `Failed to retrieve document`);
    }
  }

  /**
   * Récupère tous les documents avec pagination.
   * @param pagination - Les options de pagination.
   * @returns Un résultat de pagination contenant les documents.
   */
  async getAll(pagination: PaginationInput): Promise<PaginationResult<T>> {
    try {
      const { page, limit } = pagination;
      const start = (page - 1) * limit;
      const querySnapshot = await this.collection
        .orderBy("createdAt")
        .offset(start)
        .limit(limit)
        .get();

      const data = querySnapshot.docs.map((doc) => this.mapDocumentData(doc));
      const totalItems = (await this.collection.get()).size;

      return {
        data,
        totalItems,
        page,
        limit,
        hasNextPage: start + limit < totalItems,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      throw this.handleError(error, "Échec de la récupération des documents avec pagination");
    }
  }

  async update(id: string, updates: Partial<Omit<T, "id" | "createdAt">>): Promise<T> {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error(`Document with ID ${id} not found`);
      }

      const data = this.mapDocumentData(doc);

      if (this.softDelete && data.deletedAt) {
        throw new Error(`Document with ID ${id} has been deleted`);
      }

      const timestamp = Timestamp.now();
      const updateData = {
        ...updates,
        updatedAt: timestamp,
      };

      await docRef.update(updateData);
      const updatedDoc = await docRef.get();
      return this.mapDocumentData(updatedDoc);
    } catch (error) {
      throw this.handleError(error, `Failed to update document`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error(`Document avec l'ID ${id} non trouvé`);
      }

      if (this.softDelete) {
        const timestamp = Timestamp.now();
        await docRef.update({
          deletedAt: timestamp,
          updatedAt: timestamp,
        });
      } else {
        await docRef.delete();
      }

      return true;
    } catch (error) {
      throw this.handleError(error, `Échec de la suppression du document avec l'ID ${id}`);
    }
  }

  async paginate(options: PaginationOptions) {
    const paginationOptions = {
      ...options,
      includeSoftDeleted: options.includeSoftDeleted ?? !this.softDelete,
    };
  
    return this.paginator.paginate(paginationOptions);
  }

  private mapDocumentData(doc: DocumentSnapshot): T {
    if (!doc.exists) {
      throw new Error(`Document not found with ID ${doc.id}`);
    }

    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamps to JavaScript Dates
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      deletedAt: data.deletedAt instanceof Timestamp ? data.deletedAt.toDate() : data.deletedAt,
    } as T;
  }

  private handleError(error: unknown, message: string): Error {
    console.error("Repository Error:", error);

    if (error instanceof Error) {
      return new Error(`${message}: ${error.message}`);
    }

    return new Error(message);
  }
}