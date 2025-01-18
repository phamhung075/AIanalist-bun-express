import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { createMockService, MockedBaseService } from '../../__mocks__/BaseService.mocks';
import { createMockRepository, MockedBaseRepository } from '../../__mocks__/BaseRepository.mocks';

interface TestEntity {
  id?: string;
  name: string;
  age: number;
}

describe('MockBaseService', () => {
  let mockRepo: MockedBaseRepository<TestEntity>;
  let mockService: MockedBaseService<TestEntity>;

  beforeEach(() => {
    mockRepo = createMockRepository<TestEntity>();
    mockService = createMockService<TestEntity>(mockRepo as any);
    mockService._reset();
  });

  describe('create', () => {
    test('should successfully create an entity', async () => {
      const testData = { name: 'Test', age: 25 };
      const expectedResult = { id: 'test-id', ...testData };
      
      mockRepo.create.mockImplementation(() => Promise.resolve(expectedResult));

      const result = await mockService.create(testData);

      expect(result).toEqual(expectedResult);
      expect(mockRepo.create.mock.calls.length).toBe(1);
      expect(mockRepo.create.mock.calls[0][0]).toEqual(testData);
    });

    test('should return false on creation failure', async () => {
      const testData = { name: 'Test', age: 25 };
      mockRepo.create.mockImplementation(() => Promise.reject(new Error('Failed')));
    
      const result = await mockService.create(testData);
      expect(result).toBe(false);
    });
  });

  describe('createWithId', () => {
    test('should create entity with specific ID', async () => {
      const testId = 'test-id';
      const testData = { name: 'Test', age: 25 };
      const expectedResult = { id: testId, ...testData };

      mockRepo.createWithId.mockImplementation(() => Promise.resolve(expectedResult));

      const result = await mockService.createWithId(testId, testData);

      expect(result).toEqual(expectedResult);
      expect(mockRepo.createWithId.mock.calls.length).toBe(1);
      expect(mockRepo.createWithId.mock.calls[0]).toEqual([testId, testData]);
    });

    test('should propagate errors', async () => {
      mockRepo.createWithId.mockImplementation(() => Promise.reject(new Error('Failed')));

      await expect(mockService.createWithId('test-id', { name: 'Test', age: 25 }))
        .rejects.toThrow('Failed');
    });
  });

  describe('getAll', () => {
    test('should return all entities', async () => {
      const expectedResults = [
        { id: '1', name: 'Test 1', age: 25 },
        { id: '2', name: 'Test 2', age: 30 }
      ];
      mockRepo.getAll.mockImplementation(() => Promise.resolve(expectedResults));

      const results = await mockService.getAll();

      expect(results).toEqual(expectedResults);
      expect(mockRepo.getAll.mock.calls.length).toBe(1);
    });

    test('should propagate errors', async () => {
      mockRepo.getAll.mockImplementation(() => Promise.reject(new Error('Failed')));

      await expect(mockService.getAll()).rejects.toThrow('Failed');
    });
  });

  describe('getById', () => {
    test('should return entity by ID', async () => {
      const expectedResult = { id: 'test-id', name: 'Test', age: 25 };
      mockRepo.getById.mockImplementation(() => Promise.resolve(expectedResult));

      const result = await mockService.getById('test-id');

      expect(result).toEqual(expectedResult);
      expect(mockRepo.getById.mock.calls.length).toBe(1);
      expect(mockRepo.getById.mock.calls[0][0]).toBe('test-id');
    });

    test('should propagate errors', async () => {
      mockRepo.getById.mockImplementation(() => Promise.reject(new Error('Failed')));

      await expect(mockService.getById('test-id')).rejects.toThrow('Failed');
    });
  });

  describe('update', () => {
    test('should update entity', async () => {
      const testId = 'test-id';
      const updates = { age: 30 };
      const expectedResult = { id: testId, name: 'Test', age: 30 };

      mockRepo.update.mockImplementation(() => Promise.resolve(expectedResult));

      const result = await mockService.update(testId, updates);

      expect(result).toEqual(expectedResult);
      expect(mockRepo.update.mock.calls.length).toBe(1);
      expect(mockRepo.update.mock.calls[0]).toEqual([testId, updates]);
    });

    test('should propagate errors', async () => {
      mockRepo.update.mockImplementation(() => Promise.reject(new Error('Failed')));

      await expect(mockService.update('test-id', { age: 30 }))
        .rejects.toThrow('Failed');
    });
  });

  describe('delete', () => {
    test('should delete entity', async () => {
      mockRepo.delete.mockImplementation(() => Promise.resolve(true));

      const result = await mockService.delete('test-id');

      expect(result).toBe(true);
      expect(mockRepo.delete.mock.calls.length).toBe(1);
      expect(mockRepo.delete.mock.calls[0][0]).toBe('test-id');
    });

    test('should propagate errors', async () => {
      mockRepo.delete.mockImplementation(() => Promise.reject(new Error('Failed')));

      await expect(mockService.delete('test-id')).rejects.toThrow('Failed');
    });
  });

  describe('paginator', () => {
    test('should return paginated results', async () => {
      const testData = { id: '1', name: 'Test', age: 25 };
      mockRepo.items = [testData]; // Add data before testing
    
      mockRepo.paginator.mockImplementation(() => Promise.resolve({
        data: [testData],
        totalItems: 1,
        count: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }));
    
      const result = await mockService.paginator({ page: 1, limit: 10 });
    
      expect(result).toEqual({
        data: [testData],
        totalItems: 1,
        count: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
    

    test('should handle all=true option', async () => {
      const options = { page: 1, limit: 10, all: true };
      await mockService.paginator(options);

      expect(mockRepo.paginator.mock.calls[0][0]).toEqual(options);
    });
  });

  describe('_reset', () => {
    test('should reset all mock calls', async () => {
      await mockService.getAll();
      await mockService.getById('test-id');

      mockService._reset();

      expect(mockService.getAll.mock.calls).toHaveLength(0);
      expect(mockService.getById.mock.calls).toHaveLength(0);
    });
  });

  describe('_getCallCounts', () => {
    test('should return correct call counts', async () => {
      await mockService.create({ name: 'Test', age: 25 });
      await mockService.getAll();
      await mockService.getById('test-id');

      const callCounts = mockService._getCallCounts();

      expect(callCounts.create).toBe(1);
      expect(callCounts.getAll).toBe(1);
      expect(callCounts.getById).toBe(1);
    });
  });
})