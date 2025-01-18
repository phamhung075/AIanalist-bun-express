import { expect, test, describe, beforeEach, mock } from "bun:test";
import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '..';

describe('asyncHandler', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: ReturnType<typeof mock>;

    beforeEach(() => {
        // Create chainable mock methods that return mockRes
        mockRes = {
            json: mock(function(this: Response) { 
                return this;
            }) as any,
            status: mock(function(this: Response) {
                return this;
            }) as any
        };
        // Bind the methods to mockRes to maintain proper 'this' context
        mockRes.json = mockRes.json?.bind(mockRes);
        mockRes.status = mockRes.status?.bind(mockRes);
        
        mockReq = {};
        mockNext = mock(() => {});
    });

    test('should handle successful async operations', async () => {
        const mockFunction = mock(() => Promise.resolve({ data: 'success' }));
        const handler = asyncHandler(mockFunction);

        await handler(mockReq as Request, mockRes as Response, mockNext as NextFunction);

        expect(mockFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('should pass errors to next middleware', async () => {
        const error = new Error('Test error');
        const mockFunction = mock(() => Promise.reject(error));
        const handler = asyncHandler(mockFunction);

        await handler(mockReq as Request, mockRes as Response, mockNext);

        expect(mockFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(error);
    });
});