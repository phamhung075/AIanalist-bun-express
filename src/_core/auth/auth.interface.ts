export interface IAuth {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phoneNumber: string; // Will be formatted to E.164 format internally
}

export interface IRegister extends IAuth {
	firstName: string;
	lastName: string;
	address: string;
	postalCode: string;
	city: string;
	country: string;
}

export interface AuthTokens {
	idToken: string;
	refreshToken: string;
	user?: {
		uid: string;
		email: string;
		emailVerified: boolean;
		displayName: string;
		phoneNumber: string;
		photoURL: string;
		isAnonymous: boolean;
	};
}

export interface IUserProfileUpdate {
	displayName?: string;
	photoURL?: string;
	email?: string;
	phoneNumber?: string; // Will be formatted to E.164 format internally
	password?: string;
}
