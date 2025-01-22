import { describe, test, expect, beforeEach, mock } from "bun:test";
import { faker } from "@faker-js/faker";
import { BaseRepository } from "../BaseRepository";
import { BaseService } from "../BaseService";
import { PaginationResult } from "@/_core/helper/interfaces/rest.interface";
import {
  PaginatedResult,
  PaginationOptions,
} from "@/_core/helper/interfaces/PaginationServer.interface";
import { PaginationInput } from "@/_core/helper/validateZodSchema/Pagination.validation";

// Test interfaces
interface TestEntity {
  id?: string;
  name: string;
  value: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// Mock repository implementation
class MockRepository extends BaseRepository<TestEntity> {
  mockData: TestEntity[] = [];

  constructor() {
    super("test_collection", { softDelete: true });
  }

  override async create(
    data: Omit<TestEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<TestEntity> {
    const now = new Date();
    const newItem: TestEntity = {
      ...data,
      id: faker.string.uuid(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    this.mockData.push(newItem);
    return newItem;
  }

  override async createWithId(
    id: string,
    data: Omit<TestEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<TestEntity> {
    const now = new Date();
    const newItem: TestEntity = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    this.mockData.push(newItem);
    return newItem;
  }

  override async getAll(
    pagination: any
  ): Promise<PaginationResult<TestEntity>> {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedData = this.mockData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      totalItems: this.mockData.length,
      page: pagination.page,
      limit: pagination.limit,
      hasNextPage: endIndex < this.mockData.length,
      hasPrevPage: pagination.page > 1,
    };
  }

  override async getById(id: string): Promise<TestEntity> {
    const item = this.mockData.find((item) => item.id === id);
    if (!item) throw new Error(`Document with ID ${id} not found`);
    return item;
  }

  override async update(
    id: string,
    updates: Partial<Omit<TestEntity, "id" | "createdAt">>
  ): Promise<TestEntity> {
    const index = this.mockData.findIndex((item) => item.id === id);
    if (index === -1) throw new Error(`Document with ID ${id} not found`);

    const now = new Date();
    this.mockData[index] = {
      ...this.mockData[index],
      ...updates,
      updatedAt: now,
    };
    return this.mockData[index];
  }

  override async delete(id: string): Promise<boolean> {
    const index = this.mockData.findIndex((item) => item.id === id);
    if (index === -1) return false;

    if (this.softDelete) {
      this.mockData[index] = {
        ...this.mockData[index],
        deletedAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      this.mockData.splice(index, 1);
    }
    return true;
  }

  override async paginate(
    options: PaginationOptions
  ): Promise<PaginatedResult<TestEntity & { id: string }>> {
    const startIndex = ((options.page || 1) - 1) * (options.limit || 10);
    const endIndex = startIndex + (options.limit || 10);
    const paginatedData = this.mockData
      .filter((item) => item.id)
      .slice(startIndex, endIndex) as (TestEntity & { id: string })[];

    return {
      data: paginatedData,
      total: this.mockData.length,
      page: options.page || 1,
      limit: options.limit || 10,
      totalPages: Math.ceil(this.mockData.length / (options.limit || 10)),
      hasNextPage: endIndex < this.mockData.length,
      hasPrevPage: (options.page || 1) > 1,
    };
  }
}

// Concrete service implementation for testing
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
    // Replace console.error with a mock
    globalThis.console.error = mock(() => {});
  });

  describe("create", () => {
    test("should create a new entity successfully", async () => {
      const testData = {
        name: faker.person.fullName(),
        value: faker.number.int(),
      };

      const result = await service.create(testData);
      expect(result).toBeTruthy();
      if (result) {
        expect(result.id).toBeDefined();
        expect(result.name).toBe(testData.name);
        expect(result.value).toBe(testData.value);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
        expect(result.deletedAt).toBeNull();
      }
    });

    test("should handle creation failure", async () => {
      // Replace the create method of the repository instance
      repository.create = mock(async () => {
        throw new Error("Creation failed");
      });

      const testData = {
        name: faker.person.fullName(),
        value: faker.number.int(),
      };

      const createPromise = service.create(testData);
      await expect(createPromise).rejects.toThrow("Creation failed");
    });
  });

  describe("createWithId", () => {
    test("should create entity with specified ID", async () => {
      const id = faker.string.uuid();
      const testData = {
        name: faker.person.fullName(),
        value: faker.number.int(),
      };

      const result = await service.createWithId(id, testData);

      expect(result.id).toBe(id);
      expect(result.name).toBe(testData.name);
      expect(result.value).toBe(testData.value);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    test("should handle createWithId failure", async () => {
      // Replace the createWithId method of the repository instance
      repository.createWithId = mock(async () => {
        throw new Error("Creation with ID failed");
      });

      const testData = {
        name: faker.person.fullName(),
        value: faker.number.int(),
      };

      const createPromise = service.createWithId("test-id", testData);
      await expect(createPromise).rejects.toThrow("Creation with ID failed");
    });
  });

  describe("getAll", () => {
    test("should retrieve paginated results", async () => {
      // Create test entities
      await service.create({
        name: faker.person.fullName(),
        value: faker.number.int(),
      });
      await service.create({
        name: faker.person.fullName(),
        value: faker.number.int(),
      });

      const pagination = { page: 1, limit: 10, order: "asc" } as PaginationInput;
      const result = await service.getAll(pagination);

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.totalItems).toBeDefined();
      expect(result.page).toBe(pagination.page);
      expect(result.limit).toBe(pagination.limit);
    });

    test("should handle getAll failure", async () => {
      // Replace the getAll method of the repository instance
      repository.getAll = mock(async () => {
        throw new Error("GetAll failed");
      });

      const getAllPromise = service.getAll({
        page: 1,
        limit: 10,
        order: "asc",
      });
      await expect(getAllPromise).rejects.toThrow("GetAll failed");
    });
  });

  describe("getById", () => {
    test("should retrieve entity by ID", async () => {
      const testData = {
        name: faker.person.fullName(),
        value: faker.number.int(),
      };
      const created = await service.create(testData);

      if (created) {
        const result = await service.getById(created.id!);
        expect(result).toBeTruthy();
        expect(result?.id).toBe(created.id!);
      }
    });

    test("should handle getById failure", async () => {
      // Replace the getById method of the repository instance
      repository.getById = mock(async () => {
        throw new Error("GetById failed");
      });

      const getByIdPromise = service.getById("non-existent");
      await expect(getByIdPromise).rejects.toThrow("GetById failed");
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    test("should update entity successfully", async () => {
      const created = await service.create({
        name: faker.person.fullName(),
        value: faker.number.int(),
      });

      if (created) {
        const updates = {
          name: faker.person.fullName(),
          value: faker.number.int(),
        };

        const result = await service.update(created.id!, updates);

        expect(result).toBeTruthy();
        expect(result?.name).toBe(updates.name);
        expect(result?.value).toBe(updates.value);
        expect(result?.updatedAt).not.toBe(created.updatedAt);
      }
    });

    test("should handle non-existent entity update", async () => {
      // Replace the update method of the repository instance
      repository.update = mock(async () => {
        throw new Error("Update failed");
      });

      const updates = {
        name: faker.person.fullName(),
        value: faker.number.int(),
      };

      const updatePromise = service.update("non-existent", updates);
      await expect(updatePromise).rejects.toThrow("Update failed");
    });
  });

  describe("delete", () => {
    test("should delete entity successfully", async () => {
      const created = await service.create({
        name: faker.person.fullName(),
        value: faker.number.int(),
      });

      if (created) {
        const result = await service.delete(created.id!);
        expect(result).toBe(true);
      }
    });

    test("should handle non-existent entity deletion", async () => {
      const result = await service.delete("non-existent");
      expect(result).toBe(false);
    });
  });

  describe("paginator", () => {
    test("should paginate results successfully", async () => {
      // Create test entities
      await service.create({
        name: faker.person.fullName(),
        value: faker.number.int(),
      });
      await service.create({
        name: faker.person.fullName(),
        value: faker.number.int(),
      });

      const options = { page: 1, limit: 1 };
      const result = await service.paginator(options);

      expect(result.data.length).toBe(1);
      expect(result.page).toBe(options.page);
      expect(result.limit).toBe(options.limit);
    });

    test("should handle pagination error", async () => {
      // Replace the paginate method of the repository instance
      repository.paginate = mock(async () => {
        throw new Error("Pagination failed");
      });

      const paginatorPromise = service.paginator({});
      await expect(paginatorPromise).rejects.toThrow("Pagination failed");
      expect(console.error).toHaveBeenCalled();
    });
  });
});
