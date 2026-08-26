import { z } from 'zod';

// --- Create Booking ---
// Accept ONLY these 4 fields. Zod's .strip() silently discards any extra fields
// the frontend may send (e.g. total, listingName, ownerName — per contract quirk).
export const createBookingSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID'),
  start: z.coerce.date({ message: 'Start date is required' }),
  end: z.coerce.date({ message: 'End date is required' }),
  delivery: z.boolean().default(false),
}).strip().refine(
  (data) => data.end > data.start,
  { message: 'End date must be after start date', path: ['end'] }
);

export type CreateBookingDto = z.infer<typeof createBookingSchema>;

// --- Update Status ---
export const updateStatusSchema = z.object({
  status: z.enum(['approved', 'declined', 'cancelled', 'active', 'completed']),
  pickupCode: z.string().optional(),
  returnCode: z.string().optional(),
}).strip();

export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;

// --- List Bookings ---
export const listBookingsSchema = z.object({
  role: z.enum(['renter', 'owner']),
});

export type ListBookingsDto = z.infer<typeof listBookingsSchema>;

// --- Submit Return ---
export const submitReturnSchema = z.object({
  notes: z.string().max(2000).optional(),
}).strip();

export type SubmitReturnDto = z.infer<typeof submitReturnSchema>;
