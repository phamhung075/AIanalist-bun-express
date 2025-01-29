export class Contact implements Partial<IContact> {
	id?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	address?: string;
	postalCode?: string;
	city?: string;
	country?: string;
	message?: string;
	createdAt?: Date;
	updatedAt?: Date;
	active?: boolean;
	[key: string]: any;
}

export interface IContact {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	postalCode: string;
	city: string;
	country: string;
	message: string;
}
