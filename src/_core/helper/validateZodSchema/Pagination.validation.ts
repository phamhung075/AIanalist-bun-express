import { z } from "zod";

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

