import { FilterCondition, OrderByOption, PaginatedResult, PaginationOptions } from "@/_core/helper/interfaces/PaginationServer.interface";
import { describe, test, expect, beforeEach } from "bun:test";
import { DocumentSnapshot, FieldPath, OrderByDirection, Timestamp } from "firebase-admin/firestore";

// Mock interfaces for testing
interface TestEntity {
  id?: string;
  name: string;
  createdAt: Date;
  status: string;
  age: number;
  isDeleted?: boolean;
}

// Mock DocumentSnapshot for testing
class MockDocumentSnapshot implements Partial<DocumentSnapshot> {
  constructor(public snapshotData: any, public id: string) {}
  
  data() {
    return this.snapshotData;
  }
}

// Mock repository implementation
class MockPaginationRepository {
  private entities: TestEntity[] = [];
  private lastDoc: MockDocumentSnapshot | null = null;

  constructor() {
    // Initialize with test data
    this.entities = [
      { id: '1', name: 'Entity 1', createdAt: new Date('2024-01-01'), status: 'active', age: 25 },
      { id: '2', name: 'Entity 2', createdAt: new Date('2024-01-02'), status: 'inactive', age: 30 },
      { id: '3', name: 'Entity 3', createdAt: new Date('2024-01-03'), status: 'active', age: 35 },
      { id: '4', name: 'Entity 4', createdAt: new Date('2024-01-04'), status: 'active', age: 40, isDeleted: true },
      { id: '5', name: 'Entity 5', createdAt: new Date('2024-01-05'), status: 'inactive', age: 45 }
    ];
  }

  async paginate(options: PaginationOptions): Promise<PaginatedResult<TestEntity>> {
    let filteredData = [...this.entities];
    const startTime = Date.now();

    // Handle soft delete filtering
    if (!options.includeSoftDeleted) {
      filteredData = filteredData.filter(entity => !entity.isDeleted);
    }

    // Apply filters
    if (options.filters) {
      filteredData = this.applyFilters(filteredData, options.filters);
    }

    // Apply composite filters
    if (options.compositeFilters) {
      filteredData = this.applyCompositeFilters(filteredData, options.compositeFilters);
    }

    // Apply date range
    if (options.dateRange) {
      filteredData = this.applyDateRange(filteredData, options.dateRange);
    }

    // Apply ordering
    if (options.orderBy) {
      filteredData = this.applyOrdering(filteredData, options.orderBy);
    }

    // Handle pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Set last visible document
    this.lastDoc = paginatedData.length > 0 
      ? new MockDocumentSnapshot(paginatedData[paginatedData.length - 1], paginatedData[paginatedData.length - 1].id!)
      : null;

    return {
      data: paginatedData,
      total: filteredData.length,
      page,
      limit,
      totalPages: Math.ceil(filteredData.length / limit),
      hasNextPage: endIndex < filteredData.length,
      hasPrevPage: page > 1,
      lastVisible: this.lastDoc as any,
      executionTime: Date.now() - startTime,
      appliedFilters: {
        filters: this.transformFiltersToRecord(options.filters),
        dateRange: options.dateRange ? {
          field: typeof options.dateRange.field === 'string' ? options.dateRange.field : options.dateRange.field.toString(),
          start: options.dateRange.start,
          end: options.dateRange.end
        } : undefined,
        orderBy: this.transformOrderByToRecord(options.orderBy)
      }
    };
  }

  private applyFilters(data: TestEntity[], filters: FilterCondition[]): TestEntity[] {
    return data.filter(entity => {
      return filters.every(filter => {
        const value = entity[filter.key as keyof TestEntity];
        if (value === undefined) {
          return false; // Si la valeur est indéfinie, le filtre échoue
        }
        switch (filter.operator) {
          case '==':
            return value === filter.value;
          case '>':
            return value > filter.value;
          case '>=':
            return value >= filter.value;
          case '<':
            return value < filter.value;
          case '<=':
            return value <= filter.value;
          case '!=':
            return value !== filter.value;
          default:
            return true;
        }
      });
    });
  }

  private applyCompositeFilters(data: TestEntity[], compositeFilters: { type: 'and' | 'or', conditions: FilterCondition[] }[]): TestEntity[] {
    return data.filter(entity => {
      return compositeFilters.every(composite => {
        if (composite.type === 'and') {
          return composite.conditions.every(filter => this.evaluateFilter(entity, filter));
        } else {
          return composite.conditions.some(filter => this.evaluateFilter(entity, filter));
        }
      });
    });
  }

  private evaluateFilter(entity: TestEntity, filter: FilterCondition): boolean {
    const value = entity[filter.key as keyof TestEntity];
    if (value === undefined) {
      return false; // Si la valeur est indéfinie, le filtre échoue
    }
    switch (filter.operator) {
      case '==':
        return value === filter.value;
      case '>':
        return value > filter.value;
      case '>=':
        return value >= filter.value;
      case '<':
        return value < filter.value;
      case '<=':
        return value <= filter.value;
      case '!=':
        return value !== filter.value;
      default:
        return true;
    }
  }

  private applyDateRange(data: TestEntity[], dateRange: { field: string | FieldPath; start?: Date; end?: Date }): TestEntity[] {
    return data.filter(entity => {
      const value = entity[dateRange.field as keyof TestEntity] as Date;
      if (!value) return true;
      
      if (dateRange.start && dateRange.end) {
        return value >= dateRange.start && value <= dateRange.end;
      } else if (dateRange.start) {
        return value >= dateRange.start;
      } else if (dateRange.end) {
        return value <= dateRange.end;
      }
      return true;
    });
  }

  private applyOrdering(data: TestEntity[], orderBy: OrderByOption | OrderByOption[]): TestEntity[] {
    const orderByOptions = Array.isArray(orderBy) ? orderBy : [orderBy];
    
    return [...data].sort((a, b) => {
      for (const option of orderByOptions) {
        const field = option.field as keyof TestEntity;
        const direction = option.direction || 'asc';
        const modifier = direction === 'desc' ? -1 : 1;
        if ((a[field] ?? 0) < (b[field] ?? 0)) return -1 * modifier;
        if ((a[field] ?? 0) > (b[field] ?? 0)) return 1 * modifier;
      }
      return 0;
    });
  }

  private transformFiltersToRecord(filters?: FilterCondition[]): Record<string, any> | undefined {
    if (!filters) return undefined;
    
    return filters.reduce((acc, filter) => {
      acc[filter.key as string] = filter.value;
      return acc;
    }, {} as Record<string, any>);
  }

  private transformOrderByToRecord(orderBy?: OrderByOption | OrderByOption[]): Record<string, OrderByDirection> | undefined {
    if (!orderBy) return undefined;
    
    const options = Array.isArray(orderBy) ? orderBy : [orderBy];
    return options.reduce((acc, option) => {
      acc[option.field as string] = option.direction || 'asc';
      return acc;
    }, {} as Record<string, OrderByDirection>);
  }
}

describe('Pagination and Filtering', () => {
  let repository: MockPaginationRepository;

  beforeEach(() => {
    repository = new MockPaginationRepository();
  });

  describe('Basic Pagination', () => {
    test('should paginate results correctly', async () => {
      const options: PaginationOptions = {
        page: 1,
        limit: 2
      };

      const result = await repository.paginate(options);
      
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(4); // Excluding soft deleted
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(false);
    });

    test('should handle last page correctly', async () => {
      const options: PaginationOptions = {
        page: 2,
        limit: 3
      };

      const result = await repository.paginate(options);
      
      expect(result.data.length).toBe(1);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(true);
    });
  });

  describe('Filtering', () => {
    test('should apply single filter correctly', async () => {
      const options: PaginationOptions = {
        filters: [
          { key: 'status', operator: '==', value: 'active' }
        ]
      };

      const result = await repository.paginate(options);
      expect(result.data.every(item => item.status === 'active')).toBe(true);
      expect(result.data.length).toBe(2); // Excluding soft deleted
    });

    test('should apply multiple filters with AND logic', async () => {
      const options: PaginationOptions = {
        filters: [
          { key: 'status', operator: '==', value: 'active' },
          { key: 'age', operator: '>=', value: 30 }
        ]
      };

      const result = await repository.paginate(options);
      expect(result.data.every(item => 
        item.status === 'active' && item.age >= 30
      )).toBe(true);
    });
  });

  describe('Composite Filters', () => {
    test('should apply OR composite filter correctly', async () => {
      const options: PaginationOptions = {
        compositeFilters: [{
          type: 'or',
          conditions: [
            { key: 'status', operator: '==', value: 'active' },
            { key: 'age', operator: '>=', value: 45 }
          ]
        }]
      };

      const result = await repository.paginate(options);
      expect(result.data.every(item => 
        item.status === 'active' || item.age >= 45
      )).toBe(true);
    });
  });

  describe('Date Range Filtering', () => {
    test('should filter by date range correctly', async () => {
      const options: PaginationOptions = {
        dateRange: {
          field: 'createdAt',
          start: new Date('2024-01-02'),
          end: new Date('2024-01-04')
        }
      };

      const result = await repository.paginate(options);
      expect(result.data.every(item => 
        item.createdAt >= options.dateRange!.start! &&
        item.createdAt <= options.dateRange!.end!
      )).toBe(true);
    });
  });

  describe('Ordering', () => {
    test('should order results correctly', async () => {
      const options: PaginationOptions = {
        orderBy: {
          field: 'age',
          direction: 'desc'
        }
      };

      const result = await repository.paginate(options);
      const ages = result.data.map(item => item.age);
      expect(ages).toEqual([...ages].sort((a, b) => b - a));
    });

    test('should handle multiple ordering criteria', async () => {
      const options: PaginationOptions = {
        orderBy: [
          { field: 'status', direction: 'asc' },
          { field: 'age', direction: 'desc' }
        ]
      };

      const result = await repository.paginate(options);
      expect(result.data).toBeTruthy();
    });
  });

  describe('Soft Delete Handling', () => {
    test('should exclude soft deleted items by default', async () => {
      const options: PaginationOptions = {};
      const result = await repository.paginate(options);
      
      expect(result.data.some(item => item.isDeleted)).toBe(false);
    });

    test('should include soft deleted items when specified', async () => {
      const options: PaginationOptions = {
        includeSoftDeleted: true
      };
      
      const result = await repository.paginate(options);
      expect(result.data.some(item => item.isDeleted)).toBe(true);
    });
  });

  describe('Response Metadata', () => {
    test('should include execution time', async () => {
      const result = await repository.paginate({});
      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe('number');
    });

    test('should include applied filters in metadata', async () => {
      const options: PaginationOptions = {
        filters: [
          { key: 'status', operator: '==', value: 'active' }
        ],
        orderBy: { field: 'age', direction: 'desc' }
      };

      const result = await repository.paginate(options);
      expect(result.appliedFilters).toBeDefined();
      expect(result.appliedFilters?.filters?.status).toBe('active');
      expect(result.appliedFilters?.orderBy?.age).toBe('desc');
    });
  });
});