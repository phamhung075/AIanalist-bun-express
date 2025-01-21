import { describe, test, expect, beforeEach } from "bun:test";
import { BaseService } from "../BaseService";
import { PaginationInput } from "@/_core/helper/validateZodSchema/Pagination.validation";
import { PaginationOptions } from "@/_core/helper/interfaces/PaginationServer.interface";

// Test entity interface
interface TestEntity {
  id?: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// Mock repository implementation
class MockRepository extends BaseRepository<TestEntity> {
  private mockData: Map<string, TestEntity> = new Map();
  private mockId: number = 1;

  constructor() {
    super('test_collection');
  }

  async create(data: TestEntity): Promise<TestEntity> {
    const id = this.mockId.toString();
    this.mockId++;
    
    const timestamp = new Date();
    const entity: TestEntity = {
      ...data,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null
    };
    
    this.mockData.set(id, entity);
    return entity;
  }

  async createWithId(id: string, data: TestEntity): Promise<TestEntity> {
    if (this.mockData.has(id)) {
      throw new Error(`Document with ID ${id} already exists`);
    }

    const timestamp = new Date();
    const entity: TestEntity = {
      ...data,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null
    };

    this.mockData.set(id, entity);
    return entity;
  }

  async getById(id: string): Promise<TestEntity> {
    const entity = this.mockData.get(id);
    if (!entity) {
      throw new Error(`Document with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updates: Partial<TestEntity>): Promise<TestEntity> {
    const existing = await this.getById(id);
    const updated: TestEntity = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date()
    };
    
    this.mockData.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const exists = this.mockData.has(id);
    if (!exists) {
      throw new Error(`Document with ID ${id} not found`);
    }
    
    this.mockData.delete(id);
    return true;
  }

  async getAll(pagination: PaginationInput): Promise<PaginationResult<TestEntity>> {
    const items = Array.from(this.mockData.values());
    const { page, limit } = pagination;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      items: items.slice(start, end),
      total: items.length,
      page,
      limit,
      hasNextPage: end < items.length,
      hasPrevPage: page > 1
    };
  }

  async paginate(options: PaginationOptions): Promise<PaginationResult<TestEntity>> {
    const items = Array.from(this.mockData.values());
    const { page, limit } = options;
    const start = (page - 1) * limit;
    const end = start + limit;

    let filteredItems = items;
    
    // Apply filters if they exist
    if (options.filters) {
      filteredItems = items.filter(item => {
        return options.filters!.every(filter => {
          const value = item[filter.key as keyof TestEntity];
          if (filter.operator === '==') {
            return value === filter.value;
          }
          return true;
        });
      });
    }

    // Apply ordering if specified
    if (options.orderBy) {
      const { field, direction } = options.orderBy;
      filteredItems.sort((a, b) => {
        const aValue = a[field as keyof TestEntity];
        const bValue = b[field as keyof TestEntity];
        const modifier = direction === 'desc' ? -1 : 1;
        return aValue < bValue ? -1 * modifier : 1 * modifier;
      });
    }
    
    return {
      items: filteredItems.slice(start, end),
      total: filteredItems.length,
      page,
      limit,
      hasNextPage: end < filteredItems.length,
      hasPrevPage: page > 1
    };
  }
}

// Test service implementation
class TestService extends BaseService<TestEntity> {
  constructor(repository: BaseRepository<TestEntity>) {
    super(repository);
  }
}

describe("BaseService", () => {
  let service: TestService;
  let repository: MockRepository;

  beforeEach(() => {
    repository = new MockRepository();
    service = new TestService(repository);
  });

  describe("CRUD Operations", () => {
    test("should create an entity", async () => {
      const data = {
        name: "Test Entity",
        description: "Test Description"
      };

      const result = await service.create(data);
      expect(result).toBeTruthy();
      if (result) {  // TypeScript check since create can return false
        expect(result.id).toBeDefined();
        expect(result.name).toBe(data.name);
        expect(result.description).toBe(data.description);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
        expect(result.deletedAt).toBeNull();
      }
    });

    test("should create an entity with specific ID", async () => {
      const customId = "custom-id-1";
      const data = {
        name: "Test Entity",
        description: "Test Description"
      };

      const result = await service.createWithId(customId, data);
      expect(result.id).toBe(customId);
      expect(result.name).toBe(data.name);
      expect(result.description).toBe(data.description);
    });

    test("should get an entity by ID", async () => {
      const data = {
        name: "Test Entity",
        description: "Test Description"
      };

      const created = await service.create(data);
      expect(created).toBeTruthy();
      if (created) {
        const retrieved = await service.getById(created.id!);
        expect(retrieved).toEqual(created);
      }
    });

    test("should update an entity", async () => {
      const original = await service.create({
        name: "Original Name",
        description: "Original Description"
      });

      expect(original).toBeTruthy();
      if (original) {
        const updates = {
          name: "Updated Name"
        };

        const updated = await service.update(original.id!, updates);
        expect(updated).toBeTruthy();
        if (updated) {
          expect(updated.id).toBe(original.id);
          expect(updated.name).toBe(updates.name);
          expect(updated.description).toBe(original.description);
          expect(updated.updatedAt!.getTime()).toBeGreaterThan(original.updatedAt!.getTime());
        }
      }
    });

    test("should delete an entity", async () => {
      const created = await service.create({
        name: "Test Entity",
        description: "Test Description"
      });

      expect(created).toBeTruthy();
      if (created) {
        const deleted = await service.delete(created.id!);
        expect(deleted).toBe(true);

        await expect(service.getById(created.id!)).rejects.toThrow();
      }
    });
  });

  describe("Pagination", () => {
    test("should get all entities with pagination", async () => {
      // Create test entities
      await Promise.all([
        service.create({ name: "Entity 1", description: "Description 1" }),
        service.create({ name: "Entity 2", description: "Description 2" }),
        service.create({ name: "Entity 3", description: "Description 3" })
      ]);

      const pagination: PaginationInput = {
        page: 1,
        limit: 2,
        order: "asc"
      };

      const result = await service.getAll(pagination);
      expect(result.items.length).toBe(2);
      expect(result.total).toBe(3);
      expect(result.hasNextPage).toBe(true);
      expect(result.page).toBe(1);
    });

    test("should paginate with advanced options", async () => {
      // Create test entities
      await Promise.all([
        service.create({ name: "Active 1", description: "Test", status: "active" }),
        service.create({ name: "Active 2", description: "Test", status: "active" }),
        service.create({ name: "Inactive", description: "Test", status: "inactive" })
      ]);

      const options: PaginationOptions = {
        page: 1,
        limit: 10,
        filters: [
          { key: "status", operator: "==", value: "active" }
        ],
        orderBy: {
          field: "name",
          direction: "asc"
        }
      };

      const result = await service.paginator(options);
      expect(result.items.length).toBe(2);
      expect(result.items.every(item => item.status === "active")).toBe(true);
      expect(result.items[0].name).toBe("Active 1");
      expect(result.items[1].name).toBe("Active 2");
    });
  });
});