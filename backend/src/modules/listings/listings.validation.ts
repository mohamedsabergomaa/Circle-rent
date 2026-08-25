import { z } from 'zod';

// Shared price string validator — accepts numeric strings like "150", "29.99"
const priceString = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid price (e.g. "150.00")');

export const createListingSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.string().min(1).max(100),
  price: priceString,
  city: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  condition: z.string().min(1).max(100),
  included: z.array(z.string()).optional().default([]),
  features: z.array(z.string()).optional().default([]),
  weeklyPrice: priceString.optional(),
  monthlyPrice: priceString.optional(),
  deposit: priceString.optional(),
  deliveryFee: priceString.optional(),
});

export type CreateListingDto = z.infer<typeof createListingSchema>;

export const updateListingSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  price: priceString.optional(),
  city: z.string().min(1).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  condition: z.string().min(1).max(100).optional(),
  included: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  weeklyPrice: priceString.optional(),
  monthlyPrice: priceString.optional(),
  deposit: priceString.optional(),
  deliveryFee: priceString.optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'DRAFT', 'ARCHIVED']).optional(),
  blockedDates: z.array(z.string()).optional(),
});

export type UpdateListingDto = z.infer<typeof updateListingSchema>;

export const searchListingsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  latest: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  mine: z.coerce.boolean().optional(),
});

export type SearchListingsDto = z.infer<typeof searchListingsSchema>;
