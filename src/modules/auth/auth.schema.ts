import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z
    .string()
    .min(8)
    .max(200)
    .regex(/[A-Z]/, 'Must contain at least one upper case letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  name: z.string().min(2).max(200)
});

export const loginSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z
    .string()
    .min(8)
    .max(200)
    .regex(/[A-Z]/, 'Must contain at least one upper case letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
