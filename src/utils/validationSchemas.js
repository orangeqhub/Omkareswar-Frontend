import { z } from 'zod';

export const mobileSchema = z.string().regex(/^\d{10}$/, 'validation.invalidMobile');

export const registrationSchema = z
  .object({
    name: z.string().min(1, 'validation.required'),
    mobile: mobileSchema,
    altMobile: z.string().regex(/^\d{10}$/, 'validation.invalidMobile').optional().or(z.literal('')),
    email: z.string().email('validation.invalidEmail'),
    password: z.string().min(6, 'validation.passwordTooShort'),
    confirmPassword: z.string().min(1, 'validation.required'),
    district: z.string().min(1, 'validation.required'),
    city: z.string().min(1, 'validation.required'),
    address: z.string().min(1, 'validation.required'),
    role: z.enum(['buyer', 'seller', 'mediator']).default('buyer'),
    roleDetail: z.string().optional().or(z.literal('')),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'validation.mustAcceptTerms' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwordMismatch',
    path: ['confirmPassword'],
  });

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{4,6}$/, 'auth.error.invalidOtp'),
});
