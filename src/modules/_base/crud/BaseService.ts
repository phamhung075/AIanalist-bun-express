
import { PaginationInput } from "@/_core/helper/validateZodSchema/Pagination.validation";
import { PaginationResult } from "@/_core/helper/interfaces/rest.interface";
import { BaseRepository } from "./BaseRepository";
import { PaginationOptions } from "@/_core/helper/interfaces/PaginationServer.interface";

/**
 * Generic Service Class for CRUD Operations
 */
export abstract class BaseService<T extends { id?: string }> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  async create(data: Omit<T, "id">): Promise<T | false> {
    return await this.repository.create(data as T);
  }

  async createWithId(id: string, data: Omit<T, "id">): Promise<T> {
    return await this.repository.createWithId(id, data as T);
  }

  async getAll(pagination: PaginationInput): Promise<PaginationResult<T>> {
    return await this.repository.getAll(pagination);
  }

  async getById(id: string): Promise<T | null> {
    try {
      return await this.repository.getById(id);
    } catch (error) {
      console.error(`Error getting with ID ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    return await this.repository.update(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  async paginator(options: PaginationOptions): Promise<PaginationResult<T>> {
    try {
      return await this.repository.paginate(options) as PaginationResult<T>;
    } catch (error) {
      console.error("Error in paginator:", error);
      throw error;
    }
  }
}
