import { firebaseConfig } from '../config/dotenv.config';

export const authConfig = {
	provider: 'firebase' as const,
	firebase: firebaseConfig,
	// Keep Keycloak config for future use
	keycloak: {
		realm: process.env.KEYCLOAK_REALM || 'your-realm',
		authServerUrl:
			process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8080/auth',
		clientId: process.env.KEYCLOAK_CLIENT_ID || 'your-client-id',
		clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'your-client-secret',
	},
};
