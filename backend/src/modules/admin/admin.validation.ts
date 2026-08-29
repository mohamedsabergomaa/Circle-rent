import { z } from 'zod';

export const rejectListingSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

export type RejectListingDto = z.infer<typeof rejectListingSchema>;
