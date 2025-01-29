import { PaginationInput } from '@/_core/helper/validateZodSchema/Pagination.validation';
import { PaginationResult } from '@/_core/helper/interfaces/rest.interface';
import { BaseRepository } from './BaseRepository';
import { PaginationOptions } from '@/_core/helper/interfaces/PaginationServer.interface';

/**
 * Generic Service Class for CRUD Operations
 */
export abstract class BaseService<T extends { [key: string]: any }> {
	abstract baseRepository(): BaseRepository<T>;

	constructor(private classConstructor: new (...args: any[]) => T) {}

	protected getClassName(): string {
		return this.classConstructor.name;
	}

	async create(data: Omit<Partial<T>, 'id'>): Promise<T | false> {
		return await this.baseRepository().create(data as T);
	}

	async createWithId(id: string, data: Omit<Partial<T>, 'id'>): Promise<T> {
		return await this.baseRepository().createWithId(id, data as T);
	}

	async getAll(pagination: PaginationInput): Promise<PaginationResult<T>> {
		return await this.baseRepository().getAll(pagination);
	}

	async getById(id: string): Promise<T | null> {
		try {
			return await this.baseRepository().getById(id);
		} catch (error) {
			console.error(`Error getting with ID ${id}:`, error);
			throw error;
		}
	}

	async update(id: string, updates: Partial<T>): Promise<T | null> {
		return await this.baseRepository().update(id, updates);
	}

	async delete(id: string): Promise<boolean> {
		return await this.baseRepository().delete(id);
	}

	async paginator(options: PaginationOptions): Promise<PaginationResult<T>> {
		try {
			return (await this.baseRepository().paginate(
				options
			)) as PaginationResult<T>;
		} catch (error) {
			console.error('Error in paginator:', error);
			throw error;
		}
	}
}
