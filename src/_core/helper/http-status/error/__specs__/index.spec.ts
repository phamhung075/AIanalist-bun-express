import { describe, test, expect, beforeEach, mock, afterEach } from 'bun:test';
import { Response } from 'express';
import _ERROR from '..';
import { HttpStatusCode } from '../../common/HttpStatusCode';

describe('ErrorResponse', () => {
  let mockRes: Response;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Store original console.error
    originalConsoleError = console.error;
    
    // Mock console.error
    console.error = mock();
    
    mockRes = {
      json: mock(),
      status: mock(() => mockRes),
      setHeader: mock(),
      locals: { startTime: Date.now() },
      headersSent: false
    } as unknown as Response;
  });

  afterEach(() => {
    // Restore original console.error
    console.error = originalConsoleError;
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
    errorResponse.send(mockRes);

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
    const errorResponse = new _ERROR.InternalServerError({ message: 'Critical failure' });
    const error = new Error('Response failed');
    
    mockRes.json = mock(() => {
      throw error;
    });

    expect(() => errorResponse.send(mockRes)).toThrow('Response failed');
    expect(console.error).toHaveBeenCalledWith('Error sending response:', error);
  });

  test('should handle headers correctly', () => {
    const errorResponse = new _ERROR.BadRequestError({
      message: 'Invalid input',
      options: {
        headers: {
          'X-Custom-Header': 'test',
          'Set-Cookie': ['cookie1=value1', 'cookie2=value2']
        }
      }
    });

    errorResponse.send(mockRes);

    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Custom-Header', 'test');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Set-Cookie', ['cookie1=value1', 'cookie2=value2']);
  });
});