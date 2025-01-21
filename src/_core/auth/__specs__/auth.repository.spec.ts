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

  const verifyEmulatorConnection = async () => {
    try {
      // Try a simple operation that should fail in a specific way
      await signInWithEmailAndPassword(auth, 'test@test.com', 'password');
      return false; // Should not reach here
    } catch (error: any) {
      // If we get auth/user-not-found, the emulator is working
      return error.code === 'auth/user-not-found';
    }
  };

  beforeAll(async () => {
    // Set environment variables
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    process.env.NODE_ENV = 'test';
    
    try {
      // Cleanup existing apps
      await Promise.all(getApps().map(app => deleteApp(app)));
      
      // Initialize Firebase
      app = initializeApp(testConfig);
      auth = getAuth(app);
      firestore = getFirestore(app);

      // Connect to emulators with proper URLs
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      
      // Verify emulator connection with retries
      let connected = false;
      for (let i = 0; i < 3 && !connected; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        connected = await verifyEmulatorConnection();
        if (connected) {
          console.log('Successfully connected to Firebase emulator');
          break;
        }
      }
      
      if (!connected) {
        throw new Error('Failed to connect to Firebase emulators. Please ensure emulators are running.');
      }

    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    authRepository = new AuthRepository();
    testEmail = faker.internet.email().toLowerCase();
    testPassword = faker.internet.password({ length: 12 });
    
    try {
      await auth?.signOut();
    } catch (error) {
      // Ignore signOut errors in beforeEach
    }

    // Add a small delay after signOut
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  afterAll(async () => {
    if (app) {
      try {
        await auth?.signOut().catch(() => {});
        await new Promise(resolve => setTimeout(resolve, 1000));
        await deleteApp(app);
      } catch (error) {
        console.error('Cleanup failed:', error);
      }
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
    }, 10000);

    test('should fail when creating user with existing email', async () => {
      // First create a user
      await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Attempt to create another user with same email
      await expect(
        authRepository.createUser({
          email: testEmail,
          password: testPassword,
        })
      ).rejects.toThrow(/email.*(?:already in use|already exists)/i);
    }, 10000);
  });

  describe('loginUser', () => {
    test('should successfully login existing user', async () => {
      // Create user first
      await authRepository.createUser({
        email: testEmail,
        password: testPassword,
      });

      await auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await authRepository.loginUser(testEmail, testPassword);

      expect(result).toHaveProperty('idToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.idToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
    }, 15000);

    test('should fail with invalid credentials', async () => {
      await expect(
        authRepository.loginUser(testEmail, 'wrongpassword')
      ).rejects.toThrow(/(?:Invalid email or password|Authentication failed|user-not-found)/i);
    }, 10000);
  });

  describe('error handling', () => {
    describe('createUser', () => {
      test('should handle invalid email format', async () => {
        await expect(
          authRepository.createUser({
            email: 'invalid-email',
            password: testPassword,
          })
        ).rejects.toThrow(/(?:Invalid email|invalid email|malformed email)/i);
      });

      test('should handle weak password', async () => {
        await expect(
          authRepository.createUser({
            email: testEmail,
            password: '123',
          })
        ).rejects.toThrow(/(?:Password.*weak|weak.*password)/i);
      });
    });
  });
});