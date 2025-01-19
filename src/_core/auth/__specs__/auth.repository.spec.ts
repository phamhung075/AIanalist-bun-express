import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { faker } from '@faker-js/faker';
import { type UserCredential } from 'firebase/auth';
import { initializeApp, getApp, deleteApp, getApps } from 'firebase/app';
import AuthRepository from '../auth.repository';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const testConfig = {
  apiKey: "test-api-key",
  authDomain: "demo-test.firebaseapp.com",
  projectId: "demo-test",
  storageBucket: "demo-test.appspot.com",
  messagingSenderId: "123456789",
  appId: "test-app-id"
};

let app : any;
let auth : any;
let firestore;

describe('AuthRepository Integration Tests', () => {
  let authRepository: AuthRepository;
  let testEmail: string;
  let testPassword: string;

  beforeAll(async () => {
    // Set environment variables for testing
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.NODE_ENV = 'test';
    
    try {
      // Clean up any existing apps
      const existingApps = getApps();
      await Promise.all(existingApps.map(a => deleteApp(a)));
      
      // Initialize Firebase
      app = initializeApp(testConfig);
      auth = getAuth(app);
      firestore = getFirestore(app);

      // Connect to emulators
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      
      // Wait for connections to establish
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (app) {
      try {
        await Promise.all([
          auth?.signOut(),
          new Promise(resolve => setTimeout(resolve, 500)) // Give time for cleanup
        ]);
      } catch (error) {
        console.error('Cleanup failed:', error);
      }
    }
  });

  beforeEach(() => {
    authRepository = new AuthRepository();
    testEmail = faker.internet.email().toLowerCase();
    testPassword = faker.internet.password({ length: 12 });
  });

  describe('createUser', () => {
    test('should successfully create a new user', async () => {
      const result = await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });

      expect(result).toBeDefined();
      expect(result.user.email?.toLowerCase()).toBe(testEmail);
    }, 10000);

    test('should fail when creating user with existing email', async () => {
      // First create a user
      await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });

      // Then try to create another user with same email
      await expect(authRepository.createUser({
        email: testEmail,
        password: testPassword,
      })).rejects.toThrow(/Email is already in use/i);
    }, 10000);
  });

  describe('loginUser', () => {
    test('should successfully login existing user', async () => {
      // First create a user
      await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });

      // Then attempt to login
      const result = await authRepository.loginUser(testEmail, testPassword);

      expect(result).toHaveProperty('idToken');
      expect(result).toHaveProperty('refreshToken');
    }, 15000);

    test('should fail with invalid credentials', async () => {
      await expect(authRepository.loginUser(testEmail, 'wrongpassword'))
        .rejects.toThrow(/Invalid email or password|Authentication failed/i);
    }, 10000);
  });

  describe('verifyIdToken', () => {
    test('should verify valid token', async () => {
      // Create and login user to get token
      const userCred = await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });
      const { idToken } = await authRepository.loginUser(testEmail, testPassword);

      const result = await authRepository.verifyIdToken(idToken);

      expect(result).toHaveProperty('uid');
      expect(result.email?.toLowerCase()).toBe(testEmail);
    }, 15000);

    test('should fail with invalid token', async () => {
      await expect(authRepository.verifyIdToken('invalid-token'))
        .rejects.toThrow(/Invalid or expired token/i);
    });
  });

  describe('getUserById', () => {
    test('should get existing user', async () => {
      // Create user first
      const userCred = await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });

      const result = await authRepository.getUserById(userCred.user.uid);

      expect(result.email?.toLowerCase()).toBe(testEmail.toLowerCase());
      expect(result.uid).toBe(userCred.user.uid);
    }, 15000);

    test('should fail with non-existent user ID', async () => {
      await expect(authRepository.getUserById('non-existent-uid'))
        .rejects.toThrow(/User not found/i);
    });
  });

  describe('refreshToken', () => {
  test('should refresh token successfully', async () => {
    // First create and login user to get initial tokens
    await authRepository.createUser({
      email: testEmail,
      password: testPassword,
    });
    const { refreshToken } = await authRepository.loginUser(testEmail, testPassword);

    // Mock fetch for test environment
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () => 
      Promise.resolve(new Response(
        JSON.stringify({
          id_token: 'new-test-id-token',
          refresh_token: 'new-test-refresh-token',
        }), 
        { status: 200 }
      ));

    try {
      const result = await authRepository.refreshToken(refreshToken);

      expect(result).toHaveProperty('idToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.idToken).toBe('new-test-id-token');
      expect(result.refreshToken).toBe('new-test-refresh-token');
    } finally {
      // Restore original fetch
      globalThis.fetch = originalFetch;
    }
  }, 15000);

  test('should fail with invalid refresh token', async () => {
    await expect(authRepository.refreshToken('invalid-refresh-token'))
      .rejects.toThrow(/Failed to refresh token/i);
  });

  test('should handle network errors during token refresh', async () => {
    // Temporarily disable network to simulate failure
    process.env.FIREBASE_API_KEY = 'invalid-key';
    
    await expect(authRepository.refreshToken('some-token'))
      .rejects.toThrow(/Failed to refresh token/i);
      
    // Restore API key
    process.env.FIREBASE_API_KEY = testConfig.apiKey;
  });
});
  
  describe('error handling', () => {
    describe('createUser', () => {
      test('should handle invalid email format', async () => {
        await expect(authRepository.createUser({
          email: 'invalid-email',
          password: testPassword,
        })).rejects.toThrow(/Invalid email format/i);
      });
  
      test('should handle weak password', async () => {
        await expect(authRepository.createUser({
          email: testEmail,
          password: '123', // Too weak
        })).rejects.toThrow(/Password is too weak/i);
      });
    });
  
    describe('verifyIdToken', () => {
      test('should handle malformed tokens', async () => {
        await expect(authRepository.verifyIdToken('malformed.token.here'))
          .rejects.toThrow(/Invalid or expired token/i);
      });
    });
  
    describe('getUserById', () => {
      test('should handle internal server errors', async () => {
        // Mock the getUser method to throw an error
        const originalGetUser = authRepository['adminAuth'].getUser;
        authRepository['adminAuth'].getUser = async () => {
          throw new Error('Internal server error');
        };
  
        await expect(authRepository.getUserById('some-uid'))
          .rejects.toThrow(/Failed to get user information/i);
  
        // Restore original method
        authRepository['adminAuth'].getUser = originalGetUser;
      });
    });
  });
});