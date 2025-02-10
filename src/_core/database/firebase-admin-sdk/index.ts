import { firebaseConfig } from '@/_core/config/dotenv.config';
import { firebaseAdminAccount } from '@/_core/config/firebase-admin.account';
import { red, yellow } from 'colorette';
import {
	App,
	cert,
	getApp,
	getApps,
	initializeApp as initializeAdminApp,
} from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';
import {
	FirebaseApp,
	getApp as getClientApp,
	getApps as getClientApps,
	initializeApp as initializeClientApp,
} from 'firebase/app';
import { getAuth as getClientAuth } from 'firebase/auth';

let firebaseAdminApp: App;
let firebaseClientApp: FirebaseApp;

function validateAdminCredentials() {
	const requiredFields = ['project_id', 'private_key', 'client_email'];

	const missingFields = requiredFields.filter(
		(field) => !firebaseAdminAccount[field as keyof typeof firebaseAdminAccount]
	);

	if (missingFields.length > 0) {
		throw new Error(
			`Missing required Firebase Admin credentials: ${missingFields.join(', ')}`
		);
	}
}

// Initialize Firebase Admin SDK with better error handling
function initializeFirebaseAdmin() {
	try {
		if (getApps().length) {
			console.log(yellow('⚠️ Firebase Admin already initialized'));
			return getApp();
		}

		validateAdminCredentials();

		const adminApp = initializeAdminApp({
			credential: cert({
				projectId: firebaseAdminAccount.project_id,
				clientEmail: firebaseAdminAccount.client_email,
				privateKey: firebaseAdminAccount.private_key,
			}),
			databaseURL: process.env.DATABASE_URI,
		});

		console.log(yellow('✅ Firebase Admin initialized'));
		return adminApp;
	} catch (error) {
		console.error(red('❌ Failed to initialize Firebase Admin SDK:'), error);
		throw error;
	}
}

// Initialize Firebase Client SDK with better error handling
function initializeFirebaseClient() {
	try {
		if (getClientApps().length) {
			console.log(yellow('⚠️ Firebase Client already initialized'));
			return getClientApp();
		}

		const clientApp = initializeClientApp(firebaseConfig);
		console.log(yellow('✅ Firebase Client initialized'));
		return clientApp;
	} catch (error) {
		console.error(red('❌ Failed to initialize Firebase Client SDK:'), error);
		throw error;
	}
}

// Initialize both SDKs
firebaseAdminApp = initializeFirebaseAdmin();
firebaseClientApp = initializeFirebaseClient();

// Get service instances
const firebaseAdminAuth = getAdminAuth(firebaseAdminApp);
const firebaseClientAuth = getClientAuth(firebaseClientApp);
const firestore = getFirestore(firebaseAdminApp);
const database = getDatabase(firebaseAdminApp);

// Test Firestore connection
async function testFirestoreAccess() {
	try {
		const testDoc = firestore.collection('test').doc('testDoc');
		await testDoc.set({
			testField: 'testValue',
			timestamp: new Date(),
		});
		console.log(yellow('✅ Firestore access test successful'));
	} catch (error) {
		console.error(red('❌ Firestore access test failed:'), error);
		throw error;
	}
}

// Test user authentication
async function checkUser(app: App) {
	try {
		const testEmail = 'test.email34816@yopmail.com';
		const user = await getAdminAuth(app).getUserByEmail(testEmail);
		console.log(yellow('✅ User exists:'), user.uid);
	} catch (error) {
		console.error(red('❌ User check failed:'), error);
		throw error;
	}
}

export {
	database,
	firebaseAdminApp,
	firebaseAdminAuth,
	firebaseClientApp,
	firebaseClientAuth,
	firestore,
	testFirestoreAccess,
	checkUser,
};
