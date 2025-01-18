import { describe, test, expect, beforeEach } from "bun:test";
import { BaseService } from "../BaseService";
import {
  createMockRepository,
  MockedBaseRepository,
} from "../__mocks__/BaseRepository.mocks";
import { FetchPageResult } from "@/_core/helper/interfaces/FetchPageResult.interface";

// Test interfaces
interface TestEntity {
  id?: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Test implementation of BaseService
class TestService extends BaseService<TestEntity> {}

describe("BaseService", () => {
  let service: TestService;
  let mockRepository: MockedBaseRepository<TestEntity>;

  beforeEach(() => {
    mockRepository = createMockRepository<TestEntity>();
    service = new TestService(mockRepository as any);
  });

  describe("create", () => {
    test("should successfully create an entity", async () => {
      const testData: Omit<TestEntity, "id"> = {
        name: "Test User",
        email: "test@example.com",
      };

      const expectedEntity: TestEntity = {
        id: "123",
        ...testData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockImplementation(() =>
        Promise.resolve(expectedEntity)
      );

      const result = await service.create(testData);

      expect(result).toEqual(expectedEntity);
      expect(mockRepository.create.mock.calls.length).toBe(1);
      expect(mockRepository.create.mock.calls[0][0]).toEqual(testData);
    });

    test("should handle creation failure", async () => {
        const testData: Omit<TestEntity, "id"> = {
          name: "Test User",
          email: "test@example.com",
        };
      
        mockRepository.create.mockImplementation(() =>
          Promise.reject(new Error("Creation failed"))
        );
      
        await expect(service.create(testData)).rejects.toThrow("Creation failed");
      });
  });

  describe("createWithId", () => {
    test("should create an entity with a specific ID", async () => {
      const testId = "custom-id-123";
      const testData: Omit<TestEntity, "id"> = {
        name: "Test User",
        email: "test@example.com",
      };

      const expectedEntity: TestEntity = {
        id: testId,
        ...testData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.createWithId.mockImplementation(() =>
        Promise.resolve(expectedEntity)
      );

      const result = await service.createWithId(testId, testData);

      expect(result).toEqual(expectedEntity);
      expect(mockRepository.createWithId.mock.calls.length).toBe(1);
      expect(mockRepository.createWithId.mock.calls[0]).toEqual([
        testId,
        testData,
      ]);
    });
  });

  describe("getAll", () => {
    test("should retrieve all entities", async () => {
      const expectedEntities: TestEntity[] = [
        { id: "1", name: "User 1", email: "user1@example.com" },
        { id: "2", name: "User 2", email: "user2@example.com" },
      ];

      mockRepository.getAll.mockImplementation(() =>
        Promise.resolve(expectedEntities)
      );

      const result = await service.getAll();

      expect(result).toEqual(expectedEntities);
      expect(mockRepository.getAll.mock.calls.length).toBe(1);
    });

    test("should handle empty results", async () => {
      mockRepository.getAll.mockImplementation(() => Promise.resolve([]));

      const result = await service.getAll();

      expect(result).toEqual([]);
      expect(mockRepository.getAll.mock.calls.length).toBe(1);
    });
  });

  describe("getById", () => {
    test("should retrieve an entity by ID", async () => {
      const testId = "123";
      const expectedEntity: TestEntity = {
        id: testId,
        name: "Test User",
        email: "test@example.com",
      };

      mockRepository.getById.mockImplementation(() =>
        Promise.resolve(expectedEntity)
      );

      const result = await service.getById(testId);

      expect(result).toEqual(expectedEntity);
      expect(mockRepository.getById.mock.calls.length).toBe(1);
      expect(mockRepository.getById.mock.calls[0][0]).toBe(testId);
    });

    test("should handle non-existent entity", async () => {
      const testId = "nonexistent";
      mockRepository.getById.mockImplementation(() => Promise.resolve(null));

      const result = await service.getById(testId);

      expect(result).toBeNull();
      expect(mockRepository.getById.mock.calls.length).toBe(1);
    });
  });

  describe("update", () => {
    test("should update an existing entity", async () => {
      const testId = "123";
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      const expectedEntity: TestEntity = {
        id: testId,
        ...updateData,
        updatedAt: new Date(),
      };

      mockRepository.update.mockImplementation(() =>
        Promise.resolve(expectedEntity)
      );

      const result = await service.update(testId, updateData);

      expect(result).toEqual(expectedEntity);
      expect(mockRepository.update.mock.calls.length).toBe(1);
      expect(mockRepository.update.mock.calls[0]).toEqual([testId, updateData]);
    });

    test("should handle update of non-existent entity", async () => {
      const testId = "nonexistent";
      const updateData = { name: "Updated Name" };

      mockRepository.update.mockImplementation(() => Promise.resolve(null));

      const result = await service.update(testId, updateData);

      expect(result).toBeNull();
      expect(mockRepository.update.mock.calls.length).toBe(1);
    });
  });

  describe("delete", () => {
    test("should successfully delete an entity", async () => {
      const testId = "123";
      mockRepository.delete.mockImplementation(() => Promise.resolve(true));

      const result = await service.delete(testId);

      expect(result).toBe(true);
      expect(mockRepository.delete.mock.calls.length).toBe(1);
      expect(mockRepository.delete.mock.calls[0][0]).toBe(testId);
    });

    test("should handle deletion of non-existent entity", async () => {
      const testId = "nonexistent";
      mockRepository.delete.mockImplementation(() => Promise.resolve(false));

      const result = await service.delete(testId);

      expect(result).toBe(false);
      expect(mockRepository.delete.mock.calls.length).toBe(1);
    });
  });

  describe("paginator", () => {
    test("should return paginated results", async () => {
      const options = {
        page: 1,
        limit: 10,
        all: false,
      };
  
      const repositoryResult = {
        data: [
          { id: "1", name: "User 1", email: "user1@example.com" },
          { id: "2", name: "User 2", email: "user2@example.com" },
        ],
        totalItems: 2,
        count: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
  
      const expectedResult: FetchPageResult<TestEntity> = {
        data: [
          { id: "1", name: "User 1", email: "user1@example.com" },
          { id: "2", name: "User 2", email: "user2@example.com" },
        ],
        totalItems: 2,
        count: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
  
      mockRepository.paginator.mockImplementation(() =>
        Promise.resolve(repositoryResult)
      );
  
      const result = await service.paginator(options);
  
      expect(result).toEqual(expectedResult);
      expect(mockRepository.paginator.mock.calls[0][0].all).toBe(false); // Fixed: checking for all: false
    });
  
    test("should handle empty paginated results", async () => {
      const options = {
        page: 1,
        limit: 10,
        all: false,
      };
  
      const repositoryResult = {
        data: [], // Fixed: using consistent data structure
        totalItems: 0,
        count: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
  
      const expectedResult: FetchPageResult<TestEntity> = {
        data: [],
        totalItems: 0,
        count: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
  
      mockRepository.paginator.mockImplementation(() =>
        Promise.resolve(repositoryResult)
      );
  
      const result = await service.paginator(options);
  
      expect(result).toEqual(expectedResult);
      expect(mockRepository.paginator.mock.calls.length).toBe(1);
    });
  
    test("should handle all=true parameter", async () => {
      const options = {
        page: 1,
        limit: 10,
        all: true,
      };
  
      const repositoryResult = {
        data: [ // Fixed: using 'data' instead of 'items'
          { id: "1", name: "User 1", email: "user1@example.com" },
          { id: "2", name: "User 2", email: "user2@example.com" },
        ],
        totalItems: 2, // Fixed: using 'totalItems' instead of 'total'
        count: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
  
      const expectedResult: FetchPageResult<TestEntity> = {
        data: [
          { id: "1", name: "User 1", email: "user1@example.com" },
          { id: "2", name: "User 2", email: "user2@example.com" },
        ],
        totalItems: 2,
        count: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
  
      mockRepository.paginator.mockImplementation(() =>
        Promise.resolve(repositoryResult)
      );
  
      const result = await service.paginator(options);
  
      expect(result).toEqual(expectedResult);
      expect(mockRepository.paginator.mock.calls[0][0].all).toBe(true);
    });
  })
})