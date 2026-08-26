import { z } from 'zod';

export const createSavedSearchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  query: z.string().optional(),
  priceRange: z.string().optional(),
  minimumRating: z.coerce.number().min(0).max(5).default(0),
  location: z.string().optional(),
  latestOnly: z.boolean().default(false),
});

export type CreateSavedSearchDto = z.infer<typeof createSavedSearchSchema>;

export const updateSavedSearchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type UpdateSavedSearchDto = z.infer<typeof updateSavedSearchSchema>;
