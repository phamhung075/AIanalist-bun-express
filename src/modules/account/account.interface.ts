export enum AccountRole {
	USER = 'user',
	ADMIN = 'admin',
	SUPER_ADMIN = 'super_admin',
	ANONYMOUS = 'anonymous',
}

export enum AccountPermission {
	// User management
	VIEW_USERS = 'view_users',
	MANAGE_USERS = 'manage_users',

	// Content management
	VIEW_CONTENT = 'view_content',
	MANAGE_CONTENT = 'manage_content',

	// Subscription management
	VIEW_SUBSCRIPTIONS = 'view_subscriptions',
	MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',

	// Settings management
	VIEW_SETTINGS = 'view_settings',
	MANAGE_SETTINGS = 'manage_settings',

	// Anonymous user
	ANONYMOUS = 'anonymous',
}

export interface IAccount {
	id: string;
	uid: string; // Firebase UID
	contactId: string; // Reference to Contact
	subscriptionIds: string[]; // References to Subscriptions
	roles: AccountRole[];
	permissions: AccountPermission[];
	isActive: boolean;
	lastLogin: Date;
	createdAt: Date;
	updatedAt: Date;
}
