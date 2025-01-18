import { expect, describe, test, beforeEach, mock } from "bun:test";
import { z } from 'zod';
import { validateDTO } from "..";
import { HttpStatusCode } from "../../http-status/common/HttpStatusCode";


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

  // ✅ Test Case 1: Valid Data
  test('should pass validation with valid data', () => {
    const middleware = validateDTO(testSchema);
    middleware(mockRequest, mockResponse, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  // ✅ Test Case 2: Invalid Email
  test('should return ErrorResponse with invalid email', () => {
    mockRequest.body.email = 'invalid-email';
    
    const middleware = validateDTO(testSchema);
    middleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: HttpStatusCode.BAD_REQUEST,
        message: 'Validation Error',
        errors: [
          expect.objectContaining({
            field: 'email',
            message: 'Invalid email format',
          }),
        ],
      })
    );
  });

  // ✅ Test Case 3: Multiple Validation Errors
  test('should handle multiple validation errors', () => {
    mockRequest.body = {
      name: 'J',
      email: 'invalid',
      age: 15,
    };

    const middleware = validateDTO(testSchema);
    middleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: HttpStatusCode.BAD_REQUEST,
        message: 'Validation Error',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'name', message: 'Name must be at least 2 characters' }),
          expect.objectContaining({ field: 'email', message: 'Invalid email format' }),
          expect.objectContaining({ field: 'age', message: 'Age must be at least 18' }),
        ]),
      })
    );
  });

  // ✅ Test Case 4: Non-Zod Errors
  test('should handle non-Zod errors', () => {
    const error = new Error('Test error');
    const mockSchema = {
      parse: mock(() => { throw error; }),
    };

    const middleware = validateDTO(mockSchema as any);
    middleware(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  // ✅ Test Case 5: Nested Field Validation Errors
  test('should handle nested field validation errors', () => {
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
    middleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: HttpStatusCode.BAD_REQUEST,
        message: 'Validation Error',
        errors: [
          expect.objectContaining({
            field: 'user.profile.name',
            message: 'Name must be at least 2 characters',
          }),
        ],
      })
    );
  });

  // ✅ Test Case 6: Testing Different Request Types (body, params, query)
  test('should validate query parameters', () => {
    const querySchema = z.object({
      page: z.number().min(1, 'Page must be at least 1'),
    });

    mockRequest.query = { page: 0 };
    
    const middleware = validateDTO(querySchema, 'query');
    middleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: [
          expect.objectContaining({
            field: 'page',
            message: 'Page must be at least 1',
          }),
        ],
      })
    );
  });
});