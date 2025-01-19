import { describe, test, expect, beforeAll, afterAll, beforeEach, mock } from 'bun:test';
import { Request, Response } from 'express';
import { firebaseAuthMiddleware, getTokenCookies } from '../auth.middleware';

describe('Auth Middleware', () => {
  beforeAll(() => {
    // Mock the entire firebase-admin module
    mock.module('firebase-admin', () => {
      return {
        default: {
          apps: [],
          initializeApp: () => {},
          auth: () => ({
            verifyIdToken: async (token: string) => {
              if (token === 'valid-token') {
                return {
                  uid: 'test-uid',
                  email: 'test@example.com'
                };
              }
              throw new Error('Invalid token');
            }
          })
        }
      };
    });
  });

  // Test getTokenCookies function
  describe('getTokenCookies', () => {
    test('should extract tokens from cookies', () => {
      const mockReq = {
        headers: {
          cookie: 'idToken=test-id-token; refreshToken=test-refresh-token; otherCookie=value'
        }
      } as Request;

      const tokens = getTokenCookies(mockReq);
      
      expect(tokens.idToken).toBe('test-id-token');
      expect(tokens.refreshToken).toBe('test-refresh-token');
    });

    test('should handle missing cookies', () => {
      const mockReq = {
        headers: {}
      } as Request;

      const tokens = getTokenCookies(mockReq);
      
      expect(tokens.idToken).toBe('');
      expect(tokens.refreshToken).toBe('');
    });

    test('should handle cookies without tokens', () => {
      const mockReq = {
        headers: {
          cookie: 'otherCookie=value'
        }
      } as Request;

      const tokens = getTokenCookies(mockReq);
      
      expect(tokens.idToken).toBe('');
      expect(tokens.refreshToken).toBe('');
    });
  });

  // Test firebaseAuthMiddleware
  describe('firebaseAuthMiddleware', () => {
    test('should pass with valid token in cookie', async () => {
      const mockReq = {
        headers: {
          cookie: 'idToken=valid-token'
        }
      } as Request;

      const mockRes = {} as Response;
      let nextCalled = false;
      const mockNext = () => { nextCalled = true; };

      await firebaseAuthMiddleware(mockReq, mockRes, mockNext);
      
      expect((mockReq as any).user).toBeDefined();
      expect((mockReq as any).user.uid).toBe('test-uid');
      expect(nextCalled).toBe(true);
    });

    test('should pass with valid token in authorization header', async () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token'
        }
      } as Request;

      const mockRes = {} as Response;
      let nextCalled = false;
      const mockNext = () => { nextCalled = true; };

      await firebaseAuthMiddleware(mockReq, mockRes, mockNext);
      
      expect((mockReq as any).user).toBeDefined();
      expect((mockReq as any).user.uid).toBe('test-uid');
      expect(nextCalled).toBe(true);
    });

    test('should fail when no token is provided', async () => {
      const mockReq = {
        headers: {}
      } as Request;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.body = data;
          return this;
        }
      } as any;

      let nextCalled = false;
      const mockNext = () => { nextCalled = true; };

      await firebaseAuthMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.statusCode).toBe(401);
      expect(mockRes.body.message).toBe('Unauthorized: No token provided');
    });

    test('should fail with invalid token', async () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      } as Request;

      const mockRes = {
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          this.body = data;
          return this;
        }
      } as any;

      let nextCalled = false;
      const mockNext = () => { nextCalled = true; };

      await firebaseAuthMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.statusCode).toBe(401);
      expect(mockRes.body.message).toBe('Unauthorized: Invalid token');
    });
  });
});