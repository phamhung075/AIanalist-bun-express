import { FieldPath } from "firebase-admin/firestore";
import { DocumentSnapshot, Timestamp, WhereFilterOp } from "firebase/firestore";

// Define supported filter value types
type FilterValue = string | number | boolean | Timestamp | null | Date;

// Define filter operator types
export type FilterOperator = WhereFilterOp;

// Define individual filter structure
export interface Filter {
  key: string;
  value: FilterValue;
  operator: FilterOperator;
}

// Define sorting options
export interface orderByOptions {
  field: string;
  direction?: "asc" | "desc";
}


export interface FilterCondition {
  key: string | FieldPath;
  operator: WhereFilterOp;
  value: unknown;
}

export interface OrderByOption {
  field: string;
  direction?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  filters?: FilterCondition[];
  compositeFilters?: {
    type: 'and' | 'or';
    conditions: FilterCondition[];
  }[];
  lastVisible?: DocumentSnapshot;
  orderBy?: OrderByOption | OrderByOption[];
  select?: string[];
  dateRange?: {
    field: string;
    start?: Date;
    end?: Date;
  };
  includeSoftDeleted?: boolean;
  all?: boolean;
}

// Define the response type for paginated results
// Cache metadata interface
export interface CacheInfo {
  /** Whether the result was served from cache */
  cached: boolean;

  /** Timestamp when the data was cached */
  cachedAt?: Date;

  /** Cache key used for this result */
  cacheKey?: string;

  /** Time until cache expiration (in seconds) */
  ttl?: number;

  /** Source of the cached data (e.g., 'redis', 'memory') */
  source?: "redis" | "memory";
}

// Enhanced PaginatedResult with cache support
export interface PaginatedResult<T> {
  /** Array of result items */
  data: T[];

  /** Total number of items matching the query */
  total: number;

  /** Current page number */
  page: number;

  /** Items per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there is a next page */
  hasNextPage: boolean;

  /** Whether there is a previous page */
  hasPrevPage: boolean;

  /** Last document for cursor pagination */
  lastVisible?: DocumentSnapshot;

  /** Query execution time in milliseconds */
  executionTime?: number;

  /** Cache information */
  cache?: CacheInfo;

  /** Applied filters (useful for debugging and UI) */
  appliedFilters?: {
    filters?: Record<string, any>;
    search?: string;
    dateRange?: {
      field: string;
      start?: Date;
      end?: Date;
    };
    orderBy?: Record<string, "asc" | "desc">;
  };
}

// Example Redis cache implementation helper
export interface RedisCacheOptions {
  /** Redis key prefix */
  keyPrefix?: string;

  /** Default TTL in seconds */
  defaultTTL?: number;

  /** Whether to compress data */
  compress?: boolean;

  /** Cache tags for invalidation */
  tags?: string[];
}
