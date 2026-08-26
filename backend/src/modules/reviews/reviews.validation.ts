import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1, 'Review text is required').max(1000, 'Review is too long'),
  photoUrl: z.string().url().optional(),
});

export type CreateReviewDto = z.infer<typeof createReviewSchema>;
