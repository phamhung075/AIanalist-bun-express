import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { AuthService } from '../auth.service';
import _ERROR from '@/_core/helper/http-status/error';

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuthRepository: any;
  let mockContactService: any;

  beforeEach(() => {
    // Create mock implementations
    mockAuthRepository = {
      createUser: mock(() => ({
        user: { uid: 'test-uid', email: 'test@example.com' }
      })),
      loginUser: mock(() => ({
        idToken: 'test-id-token',
        refreshToken: 'test-refresh-token'
      })),
      verifyIdToken: mock(() => ({
        uid: 'test-uid',
        email: 'test@example.com'
      })),
      getUserById: mock(() => ({
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: false
      })),
      refreshToken: mock(() => ({
        idToken: 'new-test-id-token',
        refreshToken: 'new-test-refresh-token'
      }))
    };

    mockContactService = {
      createWithId: mock(() => ({
        id: 'test-uid',
        email: 'test@example.com'
      }))
    };

    // Initialize service with mocks
    authService = new AuthService(
      mockAuthRepository as any,
      mockContactService as any
    );
  });

  describe('register', () => {
    test('should successfully register a new user', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        address: '123 Main St',
        city: 'Anytown',
        postalCode: '12345',
        country: 'USA'
      };

      const result = await authService.register(registerData);

      expect(result.user.uid).toBe('test-uid');
      expect(result.user.email).toBe('test@example.com');
      expect(mockAuthRepository.createUser).toHaveBeenCalledWith({
        email: registerData.email,
        password: registerData.password
      });
      expect(mockContactService.createWithId).toHaveBeenCalledWith(
        'test-uid',
        {
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          phone: registerData.phone,
          address: registerData.address,
          city: registerData.city,
          postalCode: registerData.postalCode,
          country: registerData.country
        }
      );
    });

    test('should handle registration failure', async () => {
      mockAuthRepository.createUser = mock(() => {
        throw new _ERROR.ConflictError({ message: 'Email already exists' });
      });

      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        address: '123 Main St',
        city: 'Anytown',
        postalCode: '12345',
        country: 'USA'
      };

      await expect(authService.register(registerData)).rejects.toThrow('Email already exists');
      expect(mockContactService.createWithId).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('should successfully login user', async () => {
      const result = await authService.login('test@example.com', 'password123');

      expect(result.idToken).toBe('test-id-token');
      expect(result.refreshToken).toBe('test-refresh-token');
      expect(mockAuthRepository.loginUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });

    test('should handle invalid credentials', async () => {
      mockAuthRepository.loginUser = mock(() => {
        throw { code: 'auth/wrong-password' };
      });

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });

    test('should handle unexpected errors', async () => {
      mockAuthRepository.loginUser = mock(() => {
        throw new Error('Unexpected error');
      });

      await expect(
        authService.login('test@example.com', 'password123')
      ).rejects.toThrow('Failed to login due to an unexpected error');
    });
  });

  describe('verifyToken', () => {
    test('should successfully verify token', async () => {
      const result = await authService.verifyToken('valid-token');

      expect(result.uid).toBe('test-uid');
      expect(result.email).toBe('test@example.com');
      expect(mockAuthRepository.verifyIdToken).toHaveBeenCalledWith('valid-token');
    });

    test('should handle invalid token', async () => {
      mockAuthRepository.verifyIdToken = mock(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.verifyToken('invalid-token')).rejects.toThrow(
        'Invalid or expired token'
      );
    });
  });

  describe('getUser', () => {
    test('should successfully get user details', async () => {
      const result = await authService.getUser('test-uid');

      expect(result.uid).toBe('test-uid');
      expect(result.email).toBe('test@example.com');
      expect(mockAuthRepository.getUserById).toHaveBeenCalledWith('test-uid');
    });

    test('should handle user not found', async () => {
      mockAuthRepository.getUserById = mock(() => {
        throw new Error('User not found');
      });

      await expect(authService.getUser('invalid-uid')).rejects.toThrow(
        'Failed to fetch user details'
      );
    });
  });

  describe('refreshToken', () => {
    test('should successfully refresh token', async () => {
      const result = await authService.refreshToken('valid-refresh-token');

      expect(result.idToken).toBe('new-test-id-token');
      expect(result.refreshToken).toBe('new-test-refresh-token');
      expect(mockAuthRepository.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
    });

    test('should handle invalid refresh token', async () => {
      mockAuthRepository.refreshToken = mock(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(
        'Invalid or expired token'
      );
    });
  });
});