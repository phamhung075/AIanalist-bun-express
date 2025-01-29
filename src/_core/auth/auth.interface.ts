export interface IAuth {
	email: string;
	password: string;
}

export interface IRegister {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone: string;
	address: string;
	postalCode: string;
	city: string;
	country: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		email: string;
	};
}
