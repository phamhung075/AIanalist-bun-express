// This file provides an adapter pattern to make future migration to Keycloak easier
import { Service } from 'typedi';
import { UserRecord, DecodedIdToken } from 'firebase-admin/auth';
import { IAuth, IUserProfileUpdate } from '../auth.interface';
import { IAuthAdapter } from './auth.adapter.interface';
import { AccountRole, AccountPermission } from '@/modules/account';

@Service()
export class KeycloakAuthAdapter implements IAuthAdapter {
	createUser(account: IAuth): Promise<UserRecord> {
		throw new Error('Method not implemented.');
	}
	loginUser(
		email: string,
		password: string
	): Promise<{ idToken: string; refreshToken: string }> {
		throw new Error('Method not implemented.');
	}
	verifyIdToken(token: string): Promise<DecodedIdToken> {
		throw new Error('Method not implemented.');
	}
	getUserById(uid: string): Promise<UserRecord> {
		throw new Error('Method not implemented.');
	}
	refreshToken(
		refreshToken: string
	): Promise<{ idToken: string; refreshToken: string }> {
		throw new Error('Method not implemented.');
	}
	logoutUser(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	updateUserProfile(
		uid: string,
		profileData: IUserProfileUpdate
	): Promise<UserRecord> {
		throw new Error('Method not implemented.');
	}
	deleteUser(uid: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	async validateToken(token: string): Promise<boolean> {
		// Keycloak token validation logic to be implemented
		throw new Error('Keycloak integration not implemented');
	}

	async getUserRoles(userId: string): Promise<AccountRole[]> {
		// Keycloak role fetching logic to be implemented
		throw new Error('Keycloak integration not implemented');
	}

	async getUserPermissions(userId: string): Promise<AccountPermission[]> {
		// Keycloak permission fetching logic to be implemented
		throw new Error('Keycloak integration not implemented');
	}

	async hasPermission(
		userId: string,
		permission: AccountPermission
	): Promise<boolean> {
		// Keycloak permission checking logic to be implemented
		throw new Error('Keycloak integration not implemented');
	}
}
