import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import { faker } from '@faker-js/faker';
import { initializeApp, getApp, deleteApp, getApps } from 'firebase/app';
import AuthRepository from '../auth.repository';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, terminate } from 'firebase/firestore';

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
  let authRepository: any;
  let testEmail: any;
  let testPassword: any;

  // Add console logs for debugging
  console.log('Starting AuthRepository tests setup...');

  beforeAll(async () => {
    console.log('Setting up Firebase emulators...');
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.NODE_ENV = 'test';
    
    try {
      // Clean up existing apps
      const existingApps = getApps();
      await Promise.all(existingApps.map(app => deleteApp(app)));
      
      // Initialize Firebase
      app = initializeApp(testConfig);
      auth = getAuth(app);
      firestore = getFirestore(app);

      // Connect to emulators with error handling
      try {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
        connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      } catch (error) {
        console.error('Error connecting to emulators:', error);
        throw error;
      }

      console.log('Firebase setup completed successfully');
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  }); // Increase timeout for setup

  afterAll(async () => {
    console.log('Cleaning up Firebase resources...');
    try {
      if (auth) {
        await auth.signOut();
      }
      if (firestore) {
        await terminate(firestore);
      }
      if (app) {
        await deleteApp(app);
      }
      // Clear all apps
      const apps = getApps();
      await Promise.all(apps.map(a => deleteApp(a)));
      
      console.log('Cleanup completed successfully');
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }); // Increase timeout for cleanup

  beforeEach(() => {
    authRepository = new AuthRepository();
    testEmail = faker.internet.email().toLowerCase();
    testPassword = faker.internet.password({ length: 12 });
  });

  afterEach(async () => {
    if (auth) {
      try {
        await auth.signOut();
      } catch (error) {
        console.error('Error in afterEach cleanup:', error);
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
    }, 15000);

    // Other tests...
  });

  // Rest of your test cases...
});