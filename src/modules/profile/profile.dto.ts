// profile.dto.ts
import { z } from 'zod';
import {
	UpdatePasswordSchema,
	UpdateProfileSchema,
} from './profile.validation';
import { validateDTO } from '@/_core/helper/validateZodSchema';

export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const validateUpdatePasswordDTO = validateDTO(
	UpdatePasswordSchema,
	'body'
);
export const validateUpdateProfileDTO = validateDTO(
	UpdateProfileSchema,
	'body'
);
