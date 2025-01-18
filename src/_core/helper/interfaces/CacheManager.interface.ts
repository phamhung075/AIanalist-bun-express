import { PaginationOptions, PaginatedResult } from "./PaginationServer.interface";

/**
 * Cache manager interface
 */
export interface CacheManager {
    get<T>(options: PaginationOptions): Promise<PaginatedResult<T> | null>;
    set<T>(options: PaginationOptions, result: PaginatedResult<T>): Promise<void>;
    invalidate(patterns: string[]): Promise<void>;
  }