import { database } from '@database/firebase-admin-sdk';
import os from 'os';
import process from 'process';

const _SECONDS = 10000;

// ✅ Check system resource usage and log if there is an overload
export const checkSystemOverload = (): void => {
	setInterval(async () => {
		const numCores = os.cpus().length;
		const memoryUsage = process.memoryUsage().rss;

		const maxConnections = numCores * 5; // Define your own threshold here

		console.log(`Memory usage :: ${memoryUsage / 1024 / 1024} MB`);
		console.log(`maxConnections accept :: ${maxConnections}`);

		// ✅ Monitor connection status (Admin SDK does not support `.info/connected`)
		console.log('Admin SDK does not directly monitor connection status.');

		// ✅ Monitor Realtime Database read/writes (Admin SDK Example)
		const monitorDatabaseUsage = async () => {
			const ref = database.ref('news'); // Admin SDK uses `ref()` directly
			try {
				const snapshot = await ref.once('value');
				const docCount = snapshot.numChildren();
				console.log(`Number of documents (children) in Realtime Database: ${docCount}`);
			} catch (error) {
				console.error('❌ Error accessing Realtime Database:', error);
			}
		};

		monitorDatabaseUsage();
	}, _SECONDS); // Monitor every 10 seconds
};
