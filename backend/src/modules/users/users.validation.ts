import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  city: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
