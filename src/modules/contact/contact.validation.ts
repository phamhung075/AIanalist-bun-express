// contact.validation.ts
import { z } from 'zod';

export const CreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  message: z.string().optional(),
});

export const UpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  message: z.string().optional(),
});


export const PaginationSchema = z.object({
  page: z
      .string()
      .regex(/^\d+$/, 'Page must be a positive integer') // Ensure it's a valid number string
      .transform((val) => Number(val)) // Convert string to number
      .refine((val) => val > 0, 'Page must be a positive integer') // Ensure it's a positive number
      .optional()
      .default('1'), // Default value as a string
  limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a positive integer') // Ensure it's a valid number string
      .transform((val) => Number(val)) // Convert string to number
      .refine((val) => val > 0, 'Limit must be a positive integer') // Ensure it's a positive number
      .optional()
      .default('10'), // Default value as a string
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

export const IdSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});


