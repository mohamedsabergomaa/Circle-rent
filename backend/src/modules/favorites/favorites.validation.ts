import { z } from 'zod';

// The frontend sends the entire FavoriteItem (minus savedAt)
// We only care about the id, which maps to listingId
export const createFavoriteSchema = z.object({
  id: z.string().uuid(),
}).passthrough(); // Ignore other fields without throwing error

export type CreateFavoriteDto = z.infer<typeof createFavoriteSchema>;
