import { z } from 'zod';

export const CreateSchema = z.object({
	planId: z.string().min(1, 'Plan ID is required'),
	paymentMethod: z.string().min(1, 'Payment method is required'),
	autoRenew: z.boolean().default(true),
	currency: z.string().min(1, 'Currency is required'),
	amount: z.number().min(0, 'Amount must be positive'),
});

export const UpdateSchema = z.object({
	status: z.enum(['active', 'cancelled', 'expired', 'pending']).optional(),
	autoRenew: z.boolean().optional(),
	cancelReason: z.string().optional(),
	paymentMethod: z.string().optional(),
});

export const IdSchema = z.object({
	id: z.string().min(1, 'ID is required'),
});
