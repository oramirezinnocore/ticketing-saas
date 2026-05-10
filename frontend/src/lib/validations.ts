import { z } from 'zod';

// Validation messages in Spanish (Mexico)
// All validation errors are now in Spanish to match UI

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, 'El nombre es obligatorio').max(100, 'El nombre es demasiado largo'),
    email: z
      .string()
      .min(1, 'El correo electrónico es obligatorio')
      .email('Ingresa un correo electrónico válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
    confirmPassword: z.string().min(1, 'Por favor confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Event validation schemas
export const ticketTypeSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del boleto es obligatorio')
    .max(100, 'El nombre del boleto es demasiado largo'),
  price: z
    .number({ message: 'El precio debe ser un número válido' })
    .min(0, 'El precio no puede ser negativo'),
  quantity: z
    .number({ message: 'La cantidad debe ser un número válido' })
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad debe ser al menos 1'),
});

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(300, 'El título no debe exceder 300 caracteres'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  date: z.string().min(1, 'La fecha del evento es obligatoria'),
  coverImageUrl: z.string().optional(),
  coverImageAlt: z.string().max(200, 'El texto alternativo no debe exceder 200 caracteres').optional(),
  ticketTypes: z
    .array(ticketTypeSchema)
    .min(1, 'Debes agregar al menos un tipo de boleto')
    .refine(
      (types) => {
        const names = types.map((t) => t.name.toLowerCase().trim());
        return names.length === new Set(names).size;
      },
      {
        message: 'Los nombres de los tipos de boleto deben ser únicos',
      }
    ),
});

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type TicketTypeFormData = z.infer<typeof ticketTypeSchema>;
