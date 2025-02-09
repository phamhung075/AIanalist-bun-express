import {
	IAuthAdapter,
	FirebaseAuthAdapter,
	KeycloakAuthAdapter,
} from '@/modules/account/keycloak.adapter';
import { Container } from 'typedi';

export enum AuthProvider {
	FIREBASE = 'firebase',
	KEYCLOAK = 'keycloak',
}

export class AuthAdapterFactory {
	static getAdapter(provider: AuthProvider): IAuthAdapter {
		switch (provider) {
			case AuthProvider.FIREBASE:
				return Container.get(FirebaseAuthAdapter);
			case AuthProvider.KEYCLOAK:
				return Container.get(KeycloakAuthAdapter);
			default:
				throw new Error(`Unsupported auth provider: ${provider}`);
		}
	}
}
