import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { Response } from 'express';
import _ERROR from '..';
import { HttpStatusCode } from '../../common/HttpStatusCode';

describe('ErrorResponse', () => {
  let mockRes: Response;

  beforeEach(() => {
    mockRes = {
      json: mock(),
      status: mock(() => mockRes),
      locals: { startTime: Date.now() },
    } as unknown as Response;
  });

  test('should create an error response with default values', () => {
    const errorResponse = new _ERROR.ErrorResponse({ message: 'Test Error' });
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.message).toBe('Test Error');
    expect(errorResponse.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
  });

  test('should override status and message', () => {
    const errorResponse = new _ERROR.BadRequestError({ message: 'Bad request test' });
    expect(errorResponse.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(errorResponse.message).toBe('Bad request test');
  });

  test('should set metadata and options', () => {
    const errorResponse = new _ERROR.ForbiddenError({
      message: 'Forbidden Access',
      metadata: { additional: 'data' },
      options: { retryAfter: 30 },
    });
    expect(errorResponse.metadata.additional).toBe('data');
    expect(errorResponse.options.retryAfter).toBe(30);
  });

  test('should send response with correct status and metadata', () => {
    const errorResponse = new _ERROR.NotFoundError({ message: 'Resource not found' });
    errorResponse.send(mockRes as unknown as any);

    expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCode.NOT_FOUND);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Resource not found',
        metadata: expect.objectContaining({
          code: HttpStatusCode.NOT_FOUND,
          status: expect.any(String),
          responseTime: expect.any(String),
        }),
      })
    );
  });

  test('should log error if response sending fails', () => {
    console.error = mock();
    const errorResponse = new _ERROR.InternalServerError({ message: 'Critical failure' });
    mockRes.json = mock(() => {
      throw new Error('Response failed');
    });

    expect(() => errorResponse.send(mockRes)).toThrow('Response failed');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error sending response'));
  });
});