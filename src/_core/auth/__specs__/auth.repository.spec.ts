import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { faker } from '@faker-js/faker';
import { type UserCredential } from 'firebase/auth';
import { initializeApp, getApp, deleteApp, getApps } from 'firebase/app';
import AuthRepository from '../auth.repository';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const testConfig = {
  apiKey: "test-api-key",
  authDomain: "demo-test.firebaseapp.com",
  projectId: "demo-test",
  storageBucket: "demo-test.appspot.com",
  messagingSenderId: "123456789",
  appId: "test-app-id"
};

describe('AuthRepository Integration Tests', () => {
  let app: any;
  let auth: any;
  let firestore: any;
  let authRepository: AuthRepository;
  let testEmail: string;
  let testPassword: string;
  let testUid: string;

  beforeAll(async () => {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    process.env.NODE_ENV = 'test';
    
    // Ensure cleanup of any existing apps
    const apps = getApps();
    for (const app of apps) {
      await deleteApp(app);
    }
    
    // Initialize Firebase
    app = initializeApp(testConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);

    // Connect to emulators
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  beforeEach(async () => {
    authRepository = new AuthRepository();
    testEmail = faker.internet.email().toLowerCase();
    testPassword = faker.internet.password({ length: 12 });
    
    try {
      if (auth?.currentUser) {
        await auth.signOut();
      }
    } catch (error) {
      // Ignore signOut errors
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  afterAll(async () => {
    try {
      if (auth?.currentUser) {
        await auth.signOut();
      }
    } catch (error) {
      // Ignore signOut errors
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (app && !app.isDeleted) {
        await deleteApp(app);
      }
    } catch (error) {
      console.error('App cleanup error:', error);
    }
  });

  describe('createUser', () => {
    test('should successfully create a new user', async () => {
      const result = await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });

      expect(result).toBeDefined();
      expect(result.user.email?.toLowerCase()).toBe(testEmail);
    });

    test('should fail when creating user with existing email', async () => {
      // First create a user
      await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });

      // Wait for user creation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Attempt to create another user with same email
      await expect(
        authRepository.createUser({
          email: testEmail,
          password: testPassword,
        })
      ).rejects.toThrow(/email.*(?:already in use|already exists)/i);
    });
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    test('should successfully login existing user', async () => {
      const result = await authRepository.loginUser(testEmail, testPassword);

      expect(result).toHaveProperty('idToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.idToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
    });

    test('should fail with invalid credentials', async () => {
      await expect(
        authRepository.loginUser(testEmail, 'wrongpassword')
      ).rejects.toThrow(/(?:Invalid email or password|Authentication failed)/i);
    });
  });

  describe('verifyIdToken', () => {
    let testIdToken: string;

    beforeEach(async () => {
      // Create and login user to get valid token
      await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });
      const loginResult = await authRepository.loginUser(testEmail, testPassword);
      testIdToken = loginResult.idToken;
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    test('should successfully verify a valid token', async () => {
      const result = await authRepository.verifyIdToken(testIdToken);
      expect(result).toBeDefined();
      expect(result.email?.toLowerCase()).toBe(testEmail);
    });

    test('should fail with invalid token', async () => {
      await expect(
        authRepository.verifyIdToken('invalid-token')
      ).rejects.toThrow(/Invalid.*token|expired.*token/i);
    });
  });

  describe('getUserById', () => {
    beforeEach(async () => {
      // Create user and store UID
      const createResult = await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });
      testUid = createResult.user.uid;
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    test('should successfully get user by id', async () => {
      const result = await authRepository.getUserById(testUid);
      expect(result).toBeDefined();
      expect(result.email?.toLowerCase()).toBe(testEmail);
      expect(result.uid).toBe(testUid);
    });

    test('should fail with invalid user id', async () => {
      await expect(
        authRepository.getUserById('invalid-uid')
      ).rejects.toThrow(/User not found/i);
    });
  });

  describe('error handling', () => {
    test('should handle network errors in login', async () => {
      const invalidEmail = 'non-existent@example.com';
      const invalidPassword = 'wrong-password';
      
      try {
        await authRepository.loginUser(invalidEmail, invalidPassword);
        expect.unreachable('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Invalid email or password');
      }
    });

    test('should handle malformed emails', async () => {
      const invalidEmails = ['not-an-email', '@nodomain.com', ''];
      
      for (const invalidEmail of invalidEmails) {
        try {
          await authRepository.createUser({
            email: invalidEmail,
            password: testPassword,
          });
          expect.unreachable('Should have thrown an error');
        } catch (error: any) {
          // Check for either "Invalid email format" or "Failed to register user"
          expect(
            error.message === 'Invalid email format' || 
            error.message === 'Failed to register user'
          ).toBe(true);
        }
      }
    });

    test('should handle weak passwords', async () => {
      const weakPassword = '123';
      
      try {
        await authRepository.createUser({
          email: testEmail,
          password: weakPassword,
        });
        expect.unreachable('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Password is too weak');
      }
    });
  });
});