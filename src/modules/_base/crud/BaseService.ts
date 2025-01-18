import { FetchPageResult, PaginationOptions } from '@/_core/helper/interfaces/FetchPageResult.interface';
import { BaseRepository } from './BaseRepository';

/**
 * Generic Service Class for CRUD Operations
 */
export abstract class BaseService<T extends { id?: string }> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  async create(data: Omit<T, 'id'>): Promise<T | false> {
    return await this.repository.create(data);
  }

  async createWithId(id: string, data: Omit<T, 'id'>): Promise<T> {
    return await this.repository.createWithId(id, data);
  }

  async getAll(): Promise<T[]> {
    return await this.repository.getAll();
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

  async paginator(options: PaginationOptions): Promise<FetchPageResult<T>> {
    try {
      const result = await this.repository.paginator(options);
      
      // Ensure the result matches FetchPageResult interface structure
      return {
        data: result.data || [],
        totalItems: result.totalItems || 0,
        count: result.count || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 0
      };
    } catch (error) {
      console.error('Error in paginator:', error);
      throw error;
    }
  }
}