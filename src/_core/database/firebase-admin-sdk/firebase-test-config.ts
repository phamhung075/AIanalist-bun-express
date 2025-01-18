import { initializeApp, deleteApp, getApps } from 'firebase/app';
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

export async function initializeTestEnvironment() {
  // Clean up existing apps
  const existingApps = getApps();
  await Promise.all(existingApps.map(app => deleteApp(app)));

  // Initialize Firebase
  const app = initializeApp(testConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  // Connect to emulators
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(firestore, '127.0.0.1', 8080);

  return { app, auth, firestore };
}

export async function checkEmulatorHealth(): Promise<boolean> {
    try {
      const authResponse = await fetch('http://127.0.0.1:9099/');
      const firestoreResponse = await fetch('http://127.0.0.1:8080/');
      
      return authResponse.ok && firestoreResponse.ok;
    } catch (error) {
      console.error('Emulator healthcheck failed:', error);
      return false;
    }
  }