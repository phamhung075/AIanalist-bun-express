import { AccountRole, AccountPermission } from './account.interface';

export interface IPermissionMatrix {
	[AccountRole.USER]: AccountPermission[];
	[AccountRole.ADMIN]: AccountPermission[];
	[AccountRole.SUPER_ADMIN]: AccountPermission[];
	[AccountRole.ANONYMOUS]: AccountPermission[];
}

export const DEFAULT_PERMISSION_MATRIX: IPermissionMatrix = {
	[AccountRole.USER]: [
		AccountPermission.VIEW_CONTENT,
		AccountPermission.VIEW_SUBSCRIPTIONS,
	],
	[AccountRole.ADMIN]: [
		AccountPermission.VIEW_USERS,
		AccountPermission.MANAGE_USERS,
		AccountPermission.VIEW_CONTENT,
		AccountPermission.MANAGE_CONTENT,
		AccountPermission.VIEW_SUBSCRIPTIONS,
		AccountPermission.MANAGE_SUBSCRIPTIONS,
		AccountPermission.VIEW_SETTINGS,
	],
	[AccountRole.SUPER_ADMIN]: Object.values(AccountPermission),
	[AccountRole.ANONYMOUS]: [AccountPermission.ANONYMOUS],
};

export class PermissionHelper {
	static getPermissionsForRoles(roles: AccountRole[]): AccountPermission[] {
		const permissions = new Set<AccountPermission>();

		roles.forEach((role) => {
			DEFAULT_PERMISSION_MATRIX[role].forEach((permission) => {
				permissions.add(permission);
			});
		});

		return Array.from(permissions);
	}

	static hasPermission(
		userPermissions: AccountPermission[],
		requiredPermission: AccountPermission
	): boolean {
		return userPermissions.includes(requiredPermission);
	}

	static hasAnyPermission(
		userPermissions: AccountPermission[],
		requiredPermissions: AccountPermission[]
	): boolean {
		return requiredPermissions.some((permission) =>
			userPermissions.includes(permission)
		);
	}

	static hasAllPermissions(
		userPermissions: AccountPermission[],
		requiredPermissions: AccountPermission[]
	): boolean {
		return requiredPermissions.every((permission) =>
			userPermissions.includes(permission)
		);
	}
}
