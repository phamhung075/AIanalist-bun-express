import { AuthProvider } from './auth.factory';

export const authConfig = {
	provider: AuthProvider.FIREBASE, // Change to KEYCLOAK when migrating
	keycloak: {
		realm: process.env.KEYCLOAK_REALM || 'your-realm',
		authServerUrl:
			process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8080/auth',
		clientId: process.env.KEYCLOAK_CLIENT_ID || 'your-client-id',
		clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'your-client-secret',
	},
};
