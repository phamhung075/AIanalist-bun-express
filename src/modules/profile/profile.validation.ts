// profile.validation.ts
import { z } from 'zod';

export const UpdatePasswordSchema = z.object({
	currentPassword: z.string().min(1, 'Current password is required'),
	newPassword: z
		.string()
		.min(8, 'Password must be at least 8 characters long')
		.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
		.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
		.regex(/[0-9]/, 'Password must contain at least one digit')
		.regex(
			/[^a-zA-Z0-9]/,
			'Password must contain at least one special character'
		),
});

export const UpdateProfileSchema = z.object({
	firstname: z.string().min(1).optional(),
	lastname: z.string().min(1).optional(),
	company_name: z.string().optional(),
	address: z.string().optional(),
	siret: z.string().optional(),
	notification: z.boolean().optional(),
	phone: z.string().optional(),
});
