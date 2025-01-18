import { describe, test, expect, beforeEach, mock, Mock } from 'bun:test';
import { BaseRepository } from '../BaseRepository';
import { firestore } from '@/_core/database/firebase-admin-sdk';
import _ERROR from '@/_core/helper/http-status/error';
import { DocumentData, DocumentSnapshot, Query } from 'firebase-admin/firestore';
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

  beforeEach(() => {
    // Reset all mocks
    mockAdd = mock(() => Promise.resolve({ id: 'test-id' }));
    mockSet = mock(() => Promise.resolve());
    mockGet = mock(() => Promise.resolve({
      exists: true,
      id: 'test-id',
      data: () => ({ name: 'Test', description: 'Description' })
    }));
    mockUpdate = mock(() => Promise.resolve());
    mockDelete = mock(() => Promise.resolve());
    mockWhere = mock((field: string, operator: string, value: any) => mockQueryBuilder);
    mockOrderBy = mock((field: string, direction?: string) => mockQueryBuilder);
    mockLimit = mock((limit: number) => mockQueryBuilder);
    mockStartAfter = mock((snapshot: any) => mockQueryBuilder);
    mockCount = mock(() => ({
      get: () => Promise.resolve({ data: () => ({ count: 2 }) })
    }));

    // Mock query builder
    const mockQueryBuilder = {
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      startAfter: mockStartAfter,
      get: mock<() => Promise<{ docs: any[] }>>(() => Promise.resolve({
        docs: [
          {
            id: 'test-id-1',
            exists: true,
            data: () => ({ name: 'Test 1', description: 'Description 1' })
          },
          {
            id: 'test-id-2',
            exists: true,
            data: () => ({ name: 'Test 2', description: 'Description 2' })
          }
        ]
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
      const testData: Omit<TestEntity, 'id'> = {
        name: 'Test Entity',
        description: 'Test Description'
      };

      const result = await repository.create(testData);

      expect(result).toEqual({
        id: 'test-id',
        ...testData
      });
      expect(mockAdd.mock.calls.length).toBe(1);
      expect(mockAdd.mock.calls[0][0]).toMatchObject({
        ...testData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test('should handle creation failure', async () => {
      mockAdd.mockImplementation(() => Promise.reject(new Error('Creation failed')));

      await expect(repository.create({
        name: 'Test',
        description: 'Description'
      })).rejects.toThrow(_ERROR.InternalServerError);
    });
  });

  describe('createWithId', () => {
    test('should create a document with specific ID', async () => {
      const testId = 'custom-id';
      const testData: Omit<TestEntity, 'id'> = {
        name: 'Test Entity',
        description: 'Test Description'
      };

      const result = await repository.createWithId(testId, testData);

      expect(result).toEqual({
        id: testId,
        ...testData
      });
      expect(mockSet.mock.calls.length).toBe(1);
      expect(mockSet.mock.calls[0][0]).toMatchObject({
        ...testData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test('should handle createWithId failure', async () => {
      mockSet.mockImplementation(() => Promise.reject(new Error('Creation failed')));

      await expect(repository.createWithId('test-id', {
        name: 'Test',
        description: 'Description'
      })).rejects.toThrow(_ERROR.InternalServerError);
    });
  });

  describe('getAll', () => {
    test('should retrieve all documents', async () => {
      const result = await repository.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'test-id-1',
        name: 'Test 1',
        description: 'Description 1'
      });
    });

    test('should handle getAll failure', async () => {
      const mockFailGet = mock<() => Promise<any>>(() => Promise.reject(new Error('Fetch failed')));
      (firestore as any).collection = mock(() => ({
        get: mockFailGet
      }));

      await expect(repository.getAll()).rejects.toThrow(_ERROR.InternalServerError);
    });
  });

  describe('getById', () => {
    test('should retrieve a document by ID', async () => {
      const result = await repository.getById('test-id');

      expect(result).toEqual({
        id: 'test-id',
        name: 'Test',
        description: 'Description'
      });
    });

    test('should handle non-existent document', async () => {
      mockGet.mockImplementation(() => Promise.resolve({
        exists: false,
        id: 'test-id',
        data: () => null
      }));

      await expect(repository.getById('non-existent-id'))
        .rejects.toThrow(_ERROR.NotFoundError);
    });
  });

  describe('update', () => {
    test('should update a document successfully', async () => {
      const testId = 'test-id';
      const updates: Partial<TestEntity> = {
        name: 'Updated Name'
      };

      const result = await repository.update(testId, updates);

      expect(result).toEqual({
        id: testId,
        name: 'Test',
        description: 'Description'
      });
      expect(mockUpdate.mock.calls.length).toBe(1);
      expect(mockUpdate.mock.calls[0][0]).toMatchObject({
        ...updates,
        updatedAt: expect.any(Date)
      });
    });

    test('should handle update of non-existent document', async () => {
      mockGet.mockImplementation(() => Promise.resolve({
        exists: false,
        id: 'test-id',
        data: () => null
      }));

      await expect(repository.update('non-existent-id', { name: 'New Name' }))
        .rejects.toThrow(_ERROR.NotFoundError);
    });
  });

  describe('delete', () => {
    test('should delete a document successfully', async () => {
      const result = await repository.delete('test-id');

      expect(result).toBe(true);
      expect(mockDelete.mock.calls.length).toBe(1);
    });

    test('should handle deletion of non-existent document', async () => {
      mockGet.mockImplementation(() => Promise.resolve({
        exists: false,
        id: 'test-id',
        data: () => null
      }));

      await expect(repository.delete('non-existent-id'))
        .rejects.toThrow(_ERROR.NotFoundError);
    });
  });

  describe('paginator', () => {
    test('should return paginated results', async () => {
      const options = {
        page: 1,
        limit: 10,
        filters: [
          { key: 'status', operator: '==', value: 'active' }
        ],
        orderBy: { field: 'createdAt', direction: 'desc' as const }
      } as PaginationOptions;

      const result = await repository.paginator(options);

      expect(result.data).toHaveLength(2);
      expect(result.totalItems).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(mockWhere.mock.calls.length).toBe(1);
      expect(mockOrderBy.mock.calls.length).toBe(1);
      expect(mockLimit.mock.calls.length).toBe(1);
    });

    test('should handle pagination with lastVisible', async () => {
      const lastVisibleMock = {
        exists: true,
        ref: {},
        readTime: new Date(),
        data: () => null,
        id: 'last-id'
      };

      const options: PaginationOptions = {
        page: 2,
        limit: 10,
        lastVisible: lastVisibleMock as unknown as DocumentSnapshot<DocumentData>
      };

      await repository.paginator(options);

      expect(mockStartAfter.mock.calls.length).toBe(1);
    });

    test('should handle all=true option', async () => {
      const options = {
        page: 1,
        limit: 10,
        all: true
      };

      const result = await repository.paginator(options);

      expect(result.data).toHaveLength(2);
      expect(mockLimit.mock.calls.length).toBe(0);
    });
  });

  describe('error handling', () => {
    test('should handle permission denied error', async () => {
      mockAdd.mockImplementation(() => Promise.reject({ code: 'permission-denied' }));

      await expect(repository.create({
        name: 'Test',
        description: 'Description'
      })).rejects.toThrow(_ERROR.ForbiddenError);
    });

    test('should handle not found error', async () => {
      mockAdd.mockImplementation(() => Promise.reject({ code: 'not-found' }));

      await expect(repository.create({
        name: 'Test',
        description: 'Description'
      })).rejects.toThrow(_ERROR.NotFoundError);
    });

    test('should handle unknown errors', async () => {
      mockAdd.mockImplementation(() => Promise.reject({ code: 'unknown-error' }));

      await expect(repository.create({
        name: 'Test',
        description: 'Description'
      })).rejects.toThrow(_ERROR.InternalServerError);
    });
  });
});