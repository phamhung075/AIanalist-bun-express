import { accountService } from '@/modules/account';
import { contactService } from '@/modules/contact';
import { Container, Token } from 'typedi';
import { AuthAdapterFactory, AuthProvider } from './adapters/auth.factory';
import FirebaseAuthAdapter from './adapters/firebase.adapter';
import { KeycloakAuthAdapter } from './adapters/keycloak.adapter';
import AuthController from './auth.controller';
import AuthService from './auth.service';

// Initialize the Firebase adapter and register it in the container

const AUTH_ADAPTER_FireBase = new Token<FirebaseAuthAdapter>(
	'AUTH_ADAPTER_TOKEN_FireBase'
);

// const AUTH_ADAPTER_Keycloak = new Token<KeycloakAuthAdapter>(
// 	'AUTH_ADAPTER_TOKEN_Keycloak'
// );

// Register the adapter
Container.set(
	AUTH_ADAPTER_FireBase,
	AuthAdapterFactory.getAdapter(AuthProvider.FIREBASE)
);

// Container.set(
// 	AUTH_ADAPTER_Keycloak,
// 	AuthAdapterFactory.getAdapter(AuthProvider.KEYCLOAK)
// );

const authRepository = Container.get(AUTH_ADAPTER_FireBase);

// Register AuthService with its dependencies
Container.set(
	AuthService,
	new AuthService(authRepository, contactService, accountService)
);

// Get instances
const authService = Container.get(AuthService);
const authController = Container.get(AuthController);

// Export instances
export { authController, authRepository, authService };

// Export types/classes
export { default as AuthController } from './auth.controller';
export type { AuthTokens, IAuth, IRegister } from './auth.interface';
export { default as AuthService } from './auth.service';
