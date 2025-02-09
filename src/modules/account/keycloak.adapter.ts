// This file provides an adapter pattern to make future migration to Keycloak easier
import { Service } from 'typedi';
import { AccountPermission, AccountRole, IAccount } from './account.interface';
import { PermissionHelper } from './permission.helper';

export interface IAuthAdapter {
	validateToken(token: string): Promise<boolean>;
	getUserRoles(userId: string): Promise<AccountRole[]>;
	getUserPermissions(userId: string): Promise<AccountPermission[]>;
	hasPermission(
		userId: string,
		permission: AccountPermission
	): Promise<boolean>;
}

@Service()
export class FirebaseAuthAdapter implements IAuthAdapter {
	async validateToken(token: string): Promise<boolean> {
		// Current Firebase token validation logic
		return true; // Implement actual validation
	}

	async getUserRoles(userId: string): Promise<AccountRole[]> {
		// Current role fetching logic
		return [AccountRole.USER]; // Implement actual role fetching
	}

	async getUserPermissions(userId: string): Promise<AccountPermission[]> {
		const roles = await this.getUserRoles(userId);
		return PermissionHelper.getPermissionsForRoles(roles);
	}

	async hasPermission(
		userId: string,
		permission: AccountPermission
	): Promise<boolean> {
		const permissions = await this.getUserPermissions(userId);
		return PermissionHelper.hasPermission(permissions, permission);
	}
}

@Service()
export class KeycloakAuthAdapter implements IAuthAdapter {
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
