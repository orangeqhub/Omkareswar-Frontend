import { z } from 'zod';

export const mobileSchema = z.string().regex(/^\d{10}$/, 'validation.invalidMobile');

export const registrationSchema = z
  .object({
    name: z.string().min(1, 'validation.required'),
    mobile: mobileSchema,
    altMobile: z.string().regex(/^\d{10}$/, 'validation.invalidMobile').optional().or(z.literal('')),
    email: z.string().email('validation.invalidEmail'),
    district: z.string().min(1, 'validation.required'),
    city: z.string().min(1, 'validation.required'),
    address: z.string().min(1, 'validation.required'),
    role: z.enum(['buyer', 'seller', 'mediator', 'employee']).default('buyer'),
    roleDetail: z.string().optional().or(z.literal('')),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'validation.mustAcceptTerms' }) }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    aadhaarCard: z.any().optional(),
    panCard: z.any().optional(),
    certificate10th: z.any().optional(),
  })
  .refine((data) => {
    if (data.role === 'employee') {
      return !!data.password && data.password.length >= 6;
    }
    return true;
  }, {
    message: 'Password must be at least 6 characters long',
    path: ['password'],
  })
  .refine((data) => {
    if (data.role === 'employee') {
      return data.password === data.confirmPassword;
    }
    return true;
  }, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{4,6}$/, 'auth.error.invalidOtp'),
});
