import { Container } from 'typedi';

import { IAuthAdapter } from './auth.adapter.interface';
import FirebaseAuthAdapter from './firebase.adapter';
import { KeycloakAuthAdapter } from './keycloak.adapter';

export enum AuthProvider {
	FIREBASE = 'firebase',
	KEYCLOAK = 'keycloak',
}

export class AuthAdapterFactory {
	static getAdapter(provider: AuthProvider): IAuthAdapter {
		switch (provider) {
			case AuthProvider.FIREBASE:
				return Container.get(FirebaseAuthAdapter) as IAuthAdapter;
			case AuthProvider.KEYCLOAK:
				return Container.get(KeycloakAuthAdapter) as IAuthAdapter;
			default:
				throw new Error(`Unsupported auth provider: ${provider}`);
		}
	}
}

export class AuthFactory extends FirebaseAuthAdapter implements IAuthAdapter {}
