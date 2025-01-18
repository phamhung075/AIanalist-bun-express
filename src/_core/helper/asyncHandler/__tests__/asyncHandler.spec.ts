import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '..';

describe('asyncHandler', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockReq = {};
        mockRes = {
            json: jest.fn(),
            status: jest.fn()
        };
        mockNext = jest.fn();
    });

    it('should handle successful async operations', async () => {
        const mockFunction = jest.fn().mockResolvedValue({ data: 'success' });
        const handler = asyncHandler(mockFunction);

        await handler(mockReq as Request, mockRes as Response, mockNext as NextFunction);

        expect(mockFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass errors to next middleware', async () => {
        const error = new Error('Test error');
        const mockFunction = jest.fn().mockRejectedValue(error);
        const handler = asyncHandler(mockFunction);

        await handler(mockReq as Request, mockRes as Response, mockNext);

        expect(mockFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(error);
    });   
});