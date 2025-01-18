// BaseRepository.mocks.ts

import { mock } from 'bun:test';
import type { Mock } from 'bun:test';
import { FetchPageResult, PaginationOptions } from '@/_core/helper/interfaces/FetchPageResult.interface';

export class MockBaseRepository<T extends { id?: string }> {
  items: T[] = [];

  create: Mock<(data: Omit<T, 'id'>) => Promise<T>> = mock((data) => {
    const newItem = { ...data, id: Math.random().toString(36).substring(7) } as T;
    this.items.push(newItem);
    return Promise.resolve(newItem);
  });

  createWithId: Mock<(id: string, data: Omit<T, 'id'>) => Promise<T>> = mock((id, data) => {
    const newItem = { ...data, id } as T;
    this.items.push(newItem);
    return Promise.resolve(newItem);
  });

  getAll: Mock<() => Promise<T[]>> = mock(() => {
    return Promise.resolve([...this.items]);
  });

  getById: Mock<(id: string) => Promise<T | null>> = mock((id) => {
    const item = this.items.find(item => item.id === id);
    return Promise.resolve(item || null);
  });

  update: Mock<(id: string, data: Partial<T>) => Promise<T | null>> = mock((id, data) => {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.items[index] = { ...this.items[index], ...data };
    return Promise.resolve(this.items[index]);
  });

  delete: Mock<(id: string) => Promise<boolean>> = mock((id) => {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.items.splice(index, 1);
    return Promise.resolve(true);
  });

  paginator: Mock<(options: PaginationOptions) => Promise<FetchPageResult<T>>> = 
    mock((options) => {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const all = options.all || false;

      if (all) {
        return Promise.resolve({
          data: [...this.items],
          totalItems: this.items.length,
          count: this.items.length,
          page: 1,
          limit,
          totalPages: 1
        });
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = this.items.slice(startIndex, endIndex);
      const totalPages = Math.ceil(this.items.length / limit);

      return Promise.resolve({
        data: paginatedItems,
        totalItems: this.items.length,
        count: paginatedItems.length,
        page,
        limit,
        totalPages
      });
    });

  // Helper methods
  _reset(): void {
    this.items = [];
    this.create.mockClear();
    this.createWithId.mockClear();
    this.getAll.mockClear();
    this.getById.mockClear();
    this.update.mockClear();
    this.delete.mockClear();
    this.paginator.mockClear();
  }

  _setItems(items: T[]): void {
    this.items = [...items];
  }

  _getItems(): T[] {
    return [...this.items];
  }
}

// Type helper for mocked repository
export type MockedBaseRepository<T extends { id?: string }> = MockBaseRepository<T> & {
  create: Mock<(data: Omit<T, 'id'>) => Promise<T>>;
  createWithId: Mock<(id: string, data: Omit<T, 'id'>) => Promise<T>>;
  getAll: Mock<() => Promise<T[]>>;
  getById: Mock<(id: string) => Promise<T | null>>;
  update: Mock<(id: string, data: Partial<T>) => Promise<T | null>>;
  delete: Mock<(id: string) => Promise<boolean>>;
  paginator: Mock<(options: PaginationOptions) => Promise<FetchPageResult<T>>>;
};

// Helper function to create a mocked repository
export function createMockRepository<T extends { id?: string }>(): MockedBaseRepository<T> {
  return new MockBaseRepository<T>();
}