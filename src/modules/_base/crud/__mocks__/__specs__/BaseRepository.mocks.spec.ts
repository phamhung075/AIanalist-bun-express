import { describe, test, expect, beforeEach } from 'bun:test';
import { createMockRepository, MockedBaseRepository } from '../../__mocks__/BaseRepository.mocks';

interface TestEntity {
  id?: string;
  name: string;
  age: number;
}

describe('MockBaseRepository', () => {
  let mockRepo: MockedBaseRepository<TestEntity>;

  beforeEach(() => {
    mockRepo = createMockRepository<TestEntity>();
    mockRepo._reset();
  });

  describe('create', () => {
    test('should create an entity and store it', async () => {
      const testData = { name: 'Test', age: 25 };
      const result = await mockRepo.create(testData);

      expect(result.id).toBeDefined();
      expect(result.name).toBe(testData.name);
      expect(result.age).toBe(testData.age);

      const items = mockRepo._getItems();
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual(result);
    });
  });

  describe('createWithId', () => {
    test('should create an entity with specified ID', async () => {
      const testId = 'test-id';
      const testData = { name: 'Test', age: 25 };
      
      const result = await mockRepo.createWithId(testId, testData);

      expect(result.id).toBe(testId);
      expect(result.name).toBe(testData.name);
      expect(result.age).toBe(testData.age);

      const items = mockRepo._getItems();
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual(result);
    });
  });

  describe('getAll', () => {
    test('should return all stored items', async () => {
      const testItems = [
        { id: '1', name: 'Test 1', age: 25 },
        { id: '2', name: 'Test 2', age: 30 }
      ];
      mockRepo._setItems(testItems);

      const result = await mockRepo.getAll();

      expect(result).toHaveLength(2);
      expect(result).toEqual(testItems);
    });

    test('should return empty array when no items exist', async () => {
      const result = await mockRepo.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    test('should return item by ID if it exists', async () => {
      const testItem = { id: 'test-id', name: 'Test', age: 25 };
      mockRepo._setItems([testItem]);

      const result = await mockRepo.getById('test-id');

      expect(result).toEqual(testItem);
    });

    test('should return null if item does not exist', async () => {
      const result = await mockRepo.getById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    test('should update existing item', async () => {
      const testItem = { id: 'test-id', name: 'Test', age: 25 };
      mockRepo._setItems([testItem]);

      const updateData = { age: 30 };
      const result = await mockRepo.update('test-id', updateData);

      expect(result).toBeDefined();
      expect(result?.age).toBe(30);
      expect(result?.name).toBe(testItem.name);
    });

    test('should return null when updating non-existent item', async () => {
      const result = await mockRepo.update('non-existent', { name: 'New' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    test('should delete existing item', async () => {
      const testItem = { id: 'test-id', name: 'Test', age: 25 };
      mockRepo._setItems([testItem]);

      const result = await mockRepo.delete('test-id');

      expect(result).toBe(true);
      expect(mockRepo._getItems()).toHaveLength(0);
    });

    test('should return false when deleting non-existent item', async () => {
      const result = await mockRepo.delete('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('paginator', () => {
    test('should return paginated results', async () => {
      const testItems = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Test ${i + 1}`,
        age: 20 + i
      }));
      mockRepo._setItems(testItems);

      const result = await mockRepo.paginator({ page: 2, limit: 5 });

      expect(result.data).toHaveLength(5);
      expect(result.totalItems).toBe(15);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(3);
    });

    test('should handle all=true option', async () => {
      const testItems = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Test ${i + 1}`,
        age: 20 + i
      }));
      mockRepo._setItems(testItems);

      const result = await mockRepo.paginator({ page: 1, limit: 5, all: true });

      expect(result.data).toHaveLength(15);
      expect(result.totalItems).toBe(15);
      expect(result.totalPages).toBe(1);
    });

    test('paginator should return empty results if there are no items', async () => {
      const result = await mockRepo.paginator({ page: 1, limit: 5 });
    
      expect(result.data).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
    });
    test('paginator should return empty page if requested page is out of bounds', async () => {
      const testItems = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Test ${i + 1}`,
        age: 20 + i
      }));
      mockRepo._setItems(testItems);
    
      const result = await mockRepo.paginator({ page: 3, limit: 5 });
    
      expect(result.data).toEqual([]);
      expect(result.page).toBe(3);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('_reset', () => {
    test('should clear all items and mock calls', async () => {
      const testItem = { id: 'test-id', name: 'Test', age: 25 };
      mockRepo._setItems([testItem]);
      await mockRepo.getAll();
      await mockRepo.getById('test-id');

      mockRepo._reset();

      expect(mockRepo._getItems()).toHaveLength(0);
      expect(mockRepo.getAll.mock.calls).toHaveLength(0);
      expect(mockRepo.getById.mock.calls).toHaveLength(0);
    });
  });

  describe('_setItems and _getItems', () => {
    test('should set and get items correctly', () => {
      const testItems = [
        { id: '1', name: 'Test 1', age: 25 },
        { id: '2', name: 'Test 2', age: 30 }
      ];

      mockRepo._setItems(testItems);
      const retrievedItems = mockRepo._getItems();

      expect(retrievedItems).toEqual(testItems);
      expect(retrievedItems).not.toBe(testItems); // Should be a different array instance
    });
  });

  test('_reset should completely clear stored items and mocks', async () => {
    mockRepo._setItems([{ id: '1', name: 'Item 1', age: 20 }]);
  
    await mockRepo.getAll();
    await mockRepo.getById('1');
    
    expect(mockRepo._getItems()).toHaveLength(1);
  
    mockRepo._reset();
  
    expect(mockRepo._getItems()).toHaveLength(0);
    expect(mockRepo.getAll.mock.calls.length).toBe(0);
    expect(mockRepo.getById.mock.calls.length).toBe(0);
  });

  test('_setItems should properly handle an empty array', () => {
    mockRepo._setItems([]);
    expect(mockRepo._getItems()).toEqual([]);
  });

  test('_setItems should store large amounts of data correctly', () => {
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Test ${i + 1}`,
      age: 20 + i
    }));
  
    mockRepo._setItems(largeDataset);
    expect(mockRepo._getItems()).toHaveLength(100);
  });
});