import { expect, test, describe } from "bun:test";
import { API_CONFIG } from "../api-config";
import { createPagination } from "../create-pagination";

describe('createPagination', () => {
    const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
    ];

    test('should create pagination with default values', () => {
        const result = createPagination(mockData, 3);
        
        expect(result).toEqual({
            data: mockData,
            totalItems: 3,
            count: mockData.length,
            page: API_CONFIG.PAGINATION.DEFAULT_PAGE,
            limit: API_CONFIG.PAGINATION.DEFAULT_LIMIT,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
        });
    });

    test('should calculate total pages correctly', () => {
        const result = createPagination(mockData, 10, 1, 3);
        
        expect(result).toEqual({
            data: mockData,
            totalItems: 10,
            count: mockData.length,
            page: 1,
            limit: 3,
            totalPages: 4,
            hasNext: true,
            hasPrev: false
        });
    });

    test('should handle middle page navigation', () => {
        const result = createPagination(mockData, 10, 2, 3);
        
        expect(result).toEqual({
            data: mockData,
            totalItems: 10,
            count: mockData.length,
            page: 2,
            limit: 3,
            totalPages: 4,
            hasNext: true,
            hasPrev: true
        });
    });

    test('should handle last page navigation', () => {
        const result = createPagination(mockData, 10, 4, 3);
        
        expect(result).toEqual({
            data: mockData,
            totalItems: 10,
            count: mockData.length,
            page: 4,
            limit: 3,
            totalPages: 4,
            hasNext: false,
            hasPrev: true
        });
    });

    test('should handle empty data array', () => {
        const result = createPagination([], 0);
        
        expect(result).toEqual({
            data: [],
            totalItems: 0,
            count: 0,
            page: API_CONFIG.PAGINATION.DEFAULT_PAGE,
            limit: API_CONFIG.PAGINATION.DEFAULT_LIMIT,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
        });
    });

    test('should handle single item', () => {
        const singleItem = [{ id: 1, name: 'Item 1' }];
        const result = createPagination(singleItem, 1);
        
        expect(result).toEqual({
            data: singleItem,
            totalItems: 1,
            count: singleItem.length,
            page: API_CONFIG.PAGINATION.DEFAULT_PAGE,
            limit: API_CONFIG.PAGINATION.DEFAULT_LIMIT,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
        });
    });
});