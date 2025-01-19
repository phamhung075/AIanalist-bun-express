import { describe, test, expect, beforeEach, mock, Mock } from 'bun:test';
import { faker } from '@faker-js/faker';
import { BaseRepository } from '../BaseRepository';
import { firestore } from '@/_core/database/firebase-admin-sdk';
import _ERROR from '@/_core/helper/http-status/error';
import { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore';
import { PaginationOptions } from '@/_core/helper/interfaces/FetchPageResult.interface';

// Test interfaces
interface TestEntity {
  id?: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Test implementation of BaseRepository
class TestRepository extends BaseRepository<TestEntity> {
  constructor() {
    super('test_collection');
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let mockAdd: Mock<(data: any) => Promise<{ id: string }>>;
  let mockSet: Mock<(data: any) => Promise<void>>;
  let mockGet: Mock<() => Promise<{ exists: boolean; id: string; data: () => any }>>;
  let mockUpdate: Mock<(data: any) => Promise<void>>;
  let mockDelete: Mock<() => Promise<void>>;
  let mockWhere: Mock<(field: string, operator: string, value: any) => any>;
  let mockOrderBy: Mock<(field: string, direction?: string) => any>;
  let mockLimit: Mock<(limit: number) => any>;
  let mockStartAfter: Mock<(snapshot: any) => any>;
  let mockCount: Mock<() => { get: () => Promise<{ data: () => { count: number } }> }>;
  let testData: TestEntity;

  beforeEach(() => {
    // Generate fake test data
    testData = {
      name: faker.company.name(),
      description: faker.lorem.sentence()
    };

    // Reset all mocks
    mockAdd = mock(() => Promise.resolve({ id: faker.string.uuid() }));
    mockSet = mock(() => Promise.resolve());
    mockGet = mock(() => Promise.resolve({
      exists: true,
      id: faker.string.uuid(),
      data: () => ({ name: testData.name, description: testData.description })
    }));
    mockUpdate = mock(() => Promise.resolve());
    mockDelete = mock(() => Promise.resolve());
    mockWhere = mock((field: string, operator: string, value: any) => mockQueryBuilder);
    mockOrderBy = mock((field: string, direction?: string) => mockQueryBuilder);
    mockLimit = mock((limit: number) => mockQueryBuilder);
    mockStartAfter = mock((snapshot: any) => mockQueryBuilder);
    mockCount = mock(() => ({
      get: () => Promise.resolve({ data: () => ({ count: faker.number.int({ min: 1, max: 10 }) }) })
    }));

    // Mock query builder with fake data
    const mockQueryBuilder = {
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      startAfter: mockStartAfter,
      get: mock(() => Promise.resolve({
        docs: Array.from({ length: 2 }, (_, index) => ({
          id: faker.string.uuid(),
          exists: true,
          data: () => ({
            name: faker.company.name(),
            description: faker.lorem.sentence()
          })
        }))
      }))
    };

    // Mock Firestore collection
    (firestore as any).collection = mock(() => ({
      add: mockAdd,
      doc: mock(() => ({
        get: mockGet,
        set: mockSet,
        update: mockUpdate,
        delete: mockDelete
      })),
      get: mockQueryBuilder.get,
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      startAfter: mockStartAfter,
      count: mockCount
    }));

    repository = new TestRepository();
  });

  describe('create', () => {
    test('should create a new document successfully', async () => {
      const result = await repository.create(testData);

      expect(result).toEqual({
        id: expect.any(String),
        ...testData
      });
      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        ...testData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }));
    });

    test('should handle creation failure', async () => {
      mockAdd.mockImplementation(() => Promise.reject(new Error('Creation failed')));
      await expect(repository.create(testData)).rejects.toThrow(_ERROR.InternalServerError);
    });
  });

  describe('createWithId', () => {
    test('should create a document with specific ID', async () => {
      const testId = faker.string.uuid();

      const result = await repository.createWithId(testId, testData);

      expect(result).toEqual({
        id: testId,
        ...testData
      });
      expect(mockSet).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
        ...testData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }));
    });

    test('should handle createWithId failure', async () => {
      mockSet.mockImplementation(() => Promise.reject(new Error('Creation failed')));
      await expect(repository.createWithId(faker.string.uuid(), testData))
        .rejects.toThrow(_ERROR.InternalServerError);
    });
  });

  describe('getAll', () => {
    test('should retrieve all documents', async () => {
      const result = await repository.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String)
      });
    });

    test('should handle getAll failure', async () => {
      const mockFailGet = mock(() => Promise.reject(new Error('Fetch failed')));
      (firestore as any).collection = mock(() => ({
        get: mockFailGet
      }));

      await expect(repository.getAll()).rejects.toThrow(_ERROR.InternalServerError);
    });
  });

  describe('getById', () => {
    test('should retrieve a document by ID', async () => {
      const testId = faker.string.uuid();
      const result = await repository.getById(testId);

      expect(result).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String)
      });
    });

    test('should handle non-existent document', async () => {
      mockGet.mockImplementation(() => Promise.resolve({
        exists: false,
        id: faker.string.uuid(),
        data: () => null
      }));

      await expect(repository.getById(faker.string.uuid()))
        .rejects.toThrow(_ERROR.NotFoundError);
    });
  });

  describe('update', () => {
    test('should update a document successfully', async () => {
      const testId = faker.string.uuid();
      const updates: Partial<TestEntity> = {
        name: faker.company.name()
      };

      const result = await repository.update(testId, updates);

      expect(result).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String)
      });
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        ...updates,
        updatedAt: expect.any(Date)
      }));
    });

    test('should handle update of non-existent document', async () => {
      mockGet.mockImplementation(() => Promise.resolve({
        exists: false,
        id: faker.string.uuid(),
        data: () => null
      }));

      await expect(repository.update(faker.string.uuid(), { name: faker.company.name() }))
        .rejects.toThrow(_ERROR.NotFoundError);
    });
  });

  describe('delete', () => {
    test('should delete a document successfully', async () => {
      const result = await repository.delete(faker.string.uuid());

      expect(result).toBe(true);
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    test('should handle deletion of non-existent document', async () => {
      mockGet.mockImplementation(() => Promise.resolve({
        exists: false,
        id: faker.string.uuid(),
        data: () => null
      }));

      await expect(repository.delete(faker.string.uuid()))
        .rejects.toThrow(_ERROR.NotFoundError);
    });
  });

  describe('paginator', () => {
    test('should return paginated results', async () => {
      const options = {
        page: faker.number.int({ min: 1, max: 5 }),
        limit: faker.number.int({ min: 5, max: 20 }),
        filters: [
          { key: 'status', operator: '==', value: 'active' }
        ],
        orderBy: { field: 'createdAt', direction: 'desc' as const }
      } as PaginationOptions;

      const result = await repository.paginator(options);

      expect(result.data).toHaveLength(2);
      expect(result.totalItems).toBeGreaterThan(0);
      expect(result.page).toBe(options.page!);
      expect(result.limit).toBe(options.limit!);
      expect(mockWhere).toHaveBeenCalledTimes(1);
      expect(mockOrderBy).toHaveBeenCalledTimes(1);
      expect(mockLimit).toHaveBeenCalledTimes(1);
    });

    test('should handle pagination with lastVisible', async () => {
      const lastVisibleMock = {
        exists: true,
        ref: {},
        readTime: faker.date.recent(),
        data: () => null,
        id: faker.string.uuid()
      };

      const options: PaginationOptions = {
        page: 2,
        limit: faker.number.int({ min: 5, max: 20 }),
        lastVisible: lastVisibleMock as unknown as DocumentSnapshot<DocumentData>
      };

      await repository.paginator(options);
      expect(mockStartAfter).toHaveBeenCalledTimes(1);
    });

    test('should handle all=true option', async () => {
      const options = {
        page: 1,
        limit: 10,
        all: true
      };

      const result = await repository.paginator(options);

      expect(result.data).toHaveLength(2);
      expect(mockLimit).toHaveBeenCalledTimes(0);
    });
  });

  describe('error handling', () => {
    test('should handle permission denied error', async () => {
      mockAdd.mockImplementation(() => Promise.reject({ code: 'permission-denied' }));
      await expect(repository.create(testData)).rejects.toThrow(_ERROR.ForbiddenError);
    });

    test('should handle not found error', async () => {
      mockAdd.mockImplementation(() => Promise.reject({ code: 'not-found' }));
      await expect(repository.create(testData)).rejects.toThrow(_ERROR.NotFoundError);
    });

    test('should handle unknown errors', async () => {
      mockAdd.mockImplementation(() => Promise.reject({ code: 'unknown-error' }));
      await expect(repository.create(testData)).rejects.toThrow(_ERROR.InternalServerError);
    });
  });
});