import { mock } from "bun:test";
import type { Mock } from "bun:test";
import {
  FetchPageResult,
  PaginationOptions,
} from "@/_core/helper/interfaces/FetchPageResult.interface";
import { BaseRepository } from "../BaseRepository";

type RepositoryPaginationResult<T> = {
  items: T[];
  total: number;
  totalPages: number;
};
export class MockBaseService<T extends { id?: string }> {
  protected mockRepository: BaseRepository<T>;
  private items: T[] = [];

  constructor(repository: BaseRepository<T>) {
    this.mockRepository = repository;
  }

  create: Mock<(data: Omit<T, "id">) => Promise<T | false>> = mock(
    async (data) => {
      try {
        return await this.mockRepository.create(data);
      } catch (error) {
        console.error("Error creating entity:", error);
        return false;
      }
    }
  );

  createWithId: Mock<(id: string, data: Omit<T, "id">) => Promise<T>> = mock(
    async (id, data) => {
      try {
        return await this.mockRepository.createWithId(id, data);
      } catch (error) {
        console.error(`Error creating entity with ID ${id}:`, error);
        throw error;
      }
    }
  );

  getAll: Mock<() => Promise<T[]>> = mock(async () => {
    try {
      return await this.mockRepository.getAll();
    } catch (error) {
      console.error("Error getting all entities:", error);
      throw error;
    }
  });

  getById: Mock<(id: string) => Promise<T | null>> = mock(async (id) => {
    try {
      return await this.mockRepository.getById(id);
    } catch (error) {
      console.error(`Error getting entity with ID ${id}:`, error);
      throw error;
    }
  });

  update: Mock<(id: string, updates: Partial<T>) => Promise<T | null>> = mock(
    async (id, updates) => {
      try {
        return await this.mockRepository.update(id, updates);
      } catch (error) {
        console.error(`Error updating entity with ID ${id}:`, error);
        throw error;
      }
    }
  );

  delete: Mock<(id: string) => Promise<boolean>> = mock(async (id) => {
    try {
      return await this.mockRepository.delete(id);
    } catch (error) {
      console.error(`Error deleting entity with ID ${id}:`, error);
      throw error;
    }
  });

  paginator: Mock<(options: PaginationOptions) => Promise<FetchPageResult<T>>> =
  mock(async (options) => {
    return await this.mockRepository.paginator(options);
  });
  // Helper methods for testing
  _reset(): void {
    this.create.mockClear();
    this.createWithId.mockClear();
    this.getAll.mockClear();
    this.getById.mockClear();
    this.update.mockClear();
    this.delete.mockClear();
    this.paginator.mockClear();
  }

  _getCallCounts(): Record<string, number> {
    return {
      create: this.create.mock.calls.length,
      createWithId: this.createWithId.mock.calls.length,
      getAll: this.getAll.mock.calls.length,
      getById: this.getById.mock.calls.length,
      update: this.update.mock.calls.length,
      delete: this.delete.mock.calls.length,
      paginator: this.paginator.mock.calls.length,
    };
  }
}

// Helper function to create a mocked service
export function createMockService<T extends { id?: string }>(
  repository: BaseRepository<T>
): MockBaseService<T> {
  return new MockBaseService<T>(repository);
}

// Type helper for mocked service
export type MockedBaseService<T extends { id?: string }> =
  MockBaseService<T> & {
    create: Mock<(data: Omit<T, "id">) => Promise<T | false>>;
    createWithId: Mock<(id: string, data: Omit<T, "id">) => Promise<T>>;
    getAll: Mock<() => Promise<T[]>>;
    getById: Mock<(id: string) => Promise<T | null>>;
    update: Mock<(id: string, updates: Partial<T>) => Promise<T | null>>;
    delete: Mock<(id: string) => Promise<boolean>>;
    paginator: Mock<
      (options: PaginationOptions) => Promise<FetchPageResult<T>>
    >;
  };
