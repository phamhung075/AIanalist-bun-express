import type { FetchPageResult } from "../../interfaces/FetchPageResult.interface";
import { API_CONFIG } from "./api-config";



/**
 * Creates a paginated result set.
 * @param data - The array of items to include in the current page.
 * @param totalItems - The total number of items available.
 * @param page - The current page number (defaults to API_CONFIG.PAGINATION.DEFAULT_PAGE).
 * @param limit - The number of items per page (defaults to API_CONFIG.PAGINATION.DEFAULT_LIMIT).
 * @returns FetchPageResult<T>
 */
export const createPagination = <T>(
    data: T[],
    totalItems: number,
    page: number = API_CONFIG.PAGINATION.DEFAULT_PAGE,
    limit: number = API_CONFIG.PAGINATION.DEFAULT_LIMIT
): FetchPageResult<T> => {
    // Ensure the limit does not exceed the configured maximum
    const safeLimit = Math.min(limit, API_CONFIG.PAGINATION.MAX_LIMIT);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalItems / safeLimit);

    return {
        data,
        totalItems,
        count: data.length,
        page,
        totalPages,
        limit: safeLimit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};
