import { z } from 'zod';
import { AccountRole, AccountPermission } from './account.interface';

export const CreateSchema = z.object({
	email: z.string().email('Invalid email format'),
	roles: z.array(z.nativeEnum(AccountRole)).default([AccountRole.USER]),
	permissions: z.array(z.nativeEnum(AccountPermission)).optional(),
	contactId: z.string().optional(),
	subscriptionIds: z.array(z.string()).optional(),
});

export const UpdateSchema = z.object({
	email: z.string().email('Invalid email format').optional(),
	roles: z.array(z.nativeEnum(AccountRole)).optional(),
	permissions: z.array(z.nativeEnum(AccountPermission)).optional(),
	isActive: z.boolean().optional(),
	contactId: z.string().optional(),
	subscriptionIds: z.array(z.string()).optional(),
});

export const IdSchema = z.object({
	id: z.string().min(1, 'ID is required'),
});
