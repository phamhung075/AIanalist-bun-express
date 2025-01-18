import { expect, describe, test, beforeEach, mock } from "bun:test";
import { z } from 'zod';
import { validateDTO } from "..";
import { HttpStatusCode } from "../../http-status/common/HttpStatusCode";
import _ERROR from "../../http-status/error";
import { fail } from "assert";

describe('validateDTO', () => {
  const testSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    age: z.number().min(18, 'Age must be at least 18'),
  });

  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    mockRequest = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      },
      params: {},
      query: {},
    };

    mockResponse = {
      status: mock(() => mockResponse),
      json: mock(() => mockResponse),
    };

    mockNext = mock();
  });

  test('should pass validation with valid data', () => {
    const middleware = validateDTO(testSchema);
    middleware(mockRequest, mockResponse, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  test('should throw ValidationError with invalid email', () => {
    mockRequest.body.email = 'invalid-email';
    
    const middleware = validateDTO(testSchema);
    
    expect(() => middleware(mockRequest, mockResponse, mockNext)).toThrow(_ERROR.ValidationError);
    expect(() => middleware(mockRequest, mockResponse, mockNext)).toThrow('Validation Error');
  });

  test('should throw ValidationError with multiple validation errors', () => {
    mockRequest.body = {
      name: 'J',
      email: 'invalid',
      age: 15,
    };

    const middleware = validateDTO(testSchema);
    
    try {
      middleware(mockRequest, mockResponse, mockNext);
      fail('Expected middleware to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(_ERROR.ValidationError);
      expect((error as any).message).toBe('Validation Error');
      expect((error as any).errors).toEqual([
        {
          field: 'name',
          message: 'Name must be at least 2 characters'
        },
        {
          field: 'email',
          message: 'Invalid email format'
        },
        {
          field: 'age',
          message: 'Age must be at least 18'
        }
      ]);
    }
  });

  test('should throw original error for non-Zod errors', () => {
    const error = new Error('Test error');
    const mockSchema = {
      parse: mock(() => { throw error; }),
    };

    const middleware = validateDTO(mockSchema as any);
    
    expect(() => middleware(mockRequest, mockResponse, mockNext)).toThrow(error);
  });

  test('should throw ValidationError with nested field validation errors', () => {
    const nestedSchema = z.object({
      user: z.object({
        profile: z.object({
          name: z.string().min(2, 'Name must be at least 2 characters'),
        }),
      }),
    });

    mockRequest.body = {
      user: {
        profile: {
          name: 'A',
        },
      },
    };

    const middleware = validateDTO(nestedSchema);
    
    try {
      middleware(mockRequest, mockResponse, mockNext);
      fail('Expected middleware to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(_ERROR.ValidationError);
      expect((error as any).message).toBe('Validation Error');
      expect((error as any).errors).toEqual([
        {
          field: 'user.profile.name',
          message: 'Name must be at least 2 characters'
        }
      ]);
    }
  });

  test('should throw ValidationError for invalid query parameters', () => {
    const querySchema = z.object({
      page: z.number().min(1, 'Page must be at least 1'),
    });

    mockRequest.query = { page: 0 };
    
    const middleware = validateDTO(querySchema, 'query');
    
    try {
      middleware(mockRequest, mockResponse, mockNext);
      fail('Expected middleware to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(_ERROR.ValidationError);
      expect((error as any).message).toBe('Validation Error');
      expect((error as any).errors).toEqual([
        {
          field: 'page',
          message: 'Page must be at least 1'
        }
      ]);
    }
  });
});