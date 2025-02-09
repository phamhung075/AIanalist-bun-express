// profile.interface.ts
export interface Profile {
	email: string;
	firstname: string;
	lastname: string;
	company_name?: string;
	address?: string;
	siret?: string;
	notification: boolean;
	phone?: string;
	authProvider?: string;
	linkedAccounts: string[];
}

export interface UpdatePasswordDTO {
	currentPassword: string;
	newPassword: string;
}

export interface UpdateProfileDTO extends Partial<Profile> {}
