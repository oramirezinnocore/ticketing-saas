import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Event validation schemas
export const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket name is required').max(100, 'Ticket name is too long'),
  price: z
    .number({ message: 'Price must be a number' })
    .min(0, 'Price cannot be negative'),
  quantity: z
    .number({ message: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
});

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(300, 'Title must not exceed 300 characters'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Event date is required'),
  ticketTypes: z
    .array(ticketTypeSchema)
    .min(1, 'At least one ticket type is required')
    .refine(
      (types) => {
        const names = types.map((t) => t.name.toLowerCase().trim());
        return names.length === new Set(names).size;
      },
      {
        message: 'Ticket type names must be unique',
      }
    ),
});

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type TicketTypeFormData = z.infer<typeof ticketTypeSchema>;
