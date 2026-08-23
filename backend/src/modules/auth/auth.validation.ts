import { z } from 'zod';

export const signUpSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required').regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address').optional(),
});

export const signInSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
});

export const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

export const onboardingSchema = z.object({
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
});
