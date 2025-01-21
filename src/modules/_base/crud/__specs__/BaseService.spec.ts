import { describe, test, expect, beforeEach, mock } from "bun:test";

import { PaginationInput } from "@/_core/helper/validateZodSchema/Pagination.validation";
import { PaginatedResult, PaginationOptions } from "@/_core/helper/interfaces/PaginationServer.interface";
import { BaseRepository } from "../BaseRepository";
import { BaseService } from "../BaseService";

// Test interface
interface TestEntity {
  id?: string;
  name: string;
  value: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Mock repository implementation
class MockRepository extends BaseRepository<TestEntity> {
  mockData: TestEntity[] = [];

  async create(data: Omit<TestEntity, "id" | "createdAt" | "updatedAt">): Promise<TestEntity> {
    const now = new Date();
    const newItem: TestEntity = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    this.mockData.push(newItem);
    return newItem;
  }

  async createWithId(id: string, data: Omit<TestEntity, "id" | "createdAt" | "updatedAt">): Promise<TestEntity> {
    const now = new Date();
    const newItem: TestEntity = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.mockData.push(newItem);
    return newItem;
  }

  async getAll(pagination: PaginationInput) {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return {
      data: this.mockData.slice(startIndex, endIndex),
      total: this.mockData.length,
      page: pagination.page,
      limit: pagination.limit
    };
  }

  async getById(id: string): Promise<TestEntity> {
    const item = this.mockData.find(item => item.id === id);
    if (!item) {
      throw new Error(`Document with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updates: Partial<Omit<TestEntity, "id" | "createdAt">>): Promise<TestEntity> {
    const index = this.mockData.findIndex(item => item.id === id);
    if (index === -1) throw new Error(`Document with ID ${id} not found`);
    
    this.mockData[index] = {
      ...this.mockData[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.mockData[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.mockData.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.mockData.splice(index, 1);
    return true;
  }

  async paginate(options: PaginationOptions): Promise<PaginatedResult<TestEntity & { id: string }>> {
    const startIndex = ((options.page || 1) - 1) * (options.limit || 10);
    const endIndex = startIndex + (options.limit || 10);
    return {
      data: this.mockData.slice(startIndex, endIndex) as (TestEntity & { id: string })[],
      total: this.mockData.length,
      page: options.page || 1,
      limit: options.limit || 10,
      hasNextPage: endIndex < this.mockData.length,
      hasPrevPage: (options.page || 1) > 1,
      totalPages: Math.ceil(this.mockData.length / (options.limit || 10))
    };
  }
}

// Concrete implementation of BaseService for testing
class TestService extends BaseService<TestEntity> {
  constructor(repository: BaseRepository<TestEntity>) {
    super(repository);
  }
}

describe('BaseService', () => {
  let service: TestService;
  let repository: MockRepository;
  let consoleSpy: any;

  beforeEach(() => {
    repository = new MockRepository('test-collection', { softDelete: true });
    service = new TestService(repository);
    consoleSpy = mock(() => console.error);
  });

  describe('create', () => {
    test('should create a new entity successfully', async () => {
      const testData = { name: 'Test Entity', value: 123 };
      const result = await service.create(testData);
      
      expect(result).toBeTruthy();
      if (result) {
        expect(result.id).toBeDefined();
        expect(result.name).toBe(testData.name);
        expect(result.value).toBe(testData.value);
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
      } else {
        throw new Error('Creation failed');
      }
    });
  });

  describe('createWithId', () => {
    test('should create entity with specified ID', async () => {
      const id = 'test-id-123';
      const testData = { name: 'Test Entity', value: 123 };
      
      const result = await service.createWithId(id, testData);
      
      expect(result.id).toBe(id);
      expect(result.name).toBe(testData.name);
      expect(result.value).toBe(testData.value);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('getAll', () => {
    test('should retrieve paginated results', async () => {
      await service.create({ name: 'Entity 1', value: 1 });
      await service.create({ name: 'Entity 2', value: 2 });
      
      const pagination: PaginationInput = { page: 1, limit: 10, order: "asc" };
      const result = await service.getAll(pagination);
      
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.totalItems).toBeDefined();
      expect(result.page).toBe(pagination.page);
      expect(result.limit).toBe(pagination.limit);
    });
  });

  describe('getById', () => {
    test('should retrieve entity by ID', async () => {
      const created = await service.create({ name: 'Test Entity', value: 123 });
      
      const result = await service.getById(created.id!);
      
      expect(result).toBeTruthy();
      expect(result?.id).toBe(created.id);
    });

    test('should handle error when getting by ID', async () => {
      const getByIdSpy = mock(repository.getById);
      const error = new Error('Database error');
      getByIdSpy.mockImplementation(async () => { throw error; });

      await expect(service.getById('non-existent')).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    test('should update entity successfully', async () => {
      const created = await service.create({ name: 'Original', value: 100 });
      
      const updates = { name: 'Updated', value: 200 };
      const result = created ? await service.update(created.id as string, updates) : null;
      
      expect(result).toBeTruthy();
      expect(result?.name).toBe(updates.name);
      expect(result?.value).toBe(updates.value);
      if (result) {
        if (result) {
          if (result && 'updatedAt' in result) {
            expect(result.updatedAt).not.toBe(created.updatedAt);
          }
        }
      } else {
        throw new Error('Update failed');
      }
    });

    test('should handle non-existent entity update', async () => {
      const result = await service.update('non-existent', { name: 'Updated' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    test('should delete entity successfully', async () => {
      const created = await service.create({ name: 'To Delete', value: 100 });
      
      const result = await service.delete(created.id!);
      expect(result).toBe(true);
      
      const retrieved = await service.getById(created.id!);
      expect(retrieved).toBeNull();
    });

    test('should handle non-existent entity deletion', async () => {
      const result = await service.delete('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('paginator', () => {
    test('should paginate results successfully', async () => {
      await service.create({ name: 'Entity 1', value: 1 });
      await service.create({ name: 'Entity 2', value: 2 });
      
      const options: PaginationOptions = { page: 1, limit: 1 };
      const result = await service.paginator(options);
      
      expect(result.data.length).toBe(1);
      expect(result.totalPages).toBe(2);
      expect(result.page).toBe(options.page as number);
      expect(result.limit).toBe(options.limit as number);
    });

    test('should handle pagination error', async () => {
      const originalPaginate = repository.paginate;
      repository.paginate = async function() { throw new Error('Pagination error'); };
      const error = new Error('Pagination error');
      paginateSpy.mockImplementation(async () => { throw error; });

      await expect(service.paginator({})).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});