import { z } from 'zod';

/**
 * User Login Validation Schema
 */
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required')
});

/**
 * User Registration Validation Schema
 */
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required')
});


