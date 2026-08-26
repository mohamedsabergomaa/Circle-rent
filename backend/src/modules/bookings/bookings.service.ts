import { BookingStatus, ListingStatus, Prisma } from '@prisma/client';
import { prisma } from '../../common/config/prisma';
import { supabase } from '../../common/config/supabase';
import { ApiError } from '../../common/errors/ApiError';
import { CreateBookingDto, UpdateStatusDto, SubmitReturnDto } from './bookings.validation';

// ────────────────────────────────────────────────────────────────────
// Helper: generate a random 6-digit code (string, zero-padded)
// ────────────────────────────────────────────────────────────────────
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ────────────────────────────────────────────────────────────────────
// Helper: compute the set of YYYY-MM-DD date strings a booking spans
// ────────────────────────────────────────────────────────────────────
function getDateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  while (current < end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// ────────────────────────────────────────────────────────────────────
// Helper: map a Prisma Booking (with listing+owner included) to the
// MockBooking shape expected by the API contract.
// ────────────────────────────────────────────────────────────────────
function toMockBooking(booking: any) {
  return {
    id: booking.id,
    listingId: booking.listingId,
    listingName: booking.listing?.name || '',
    listingImage: booking.listing?.image || '',
    ownerName: booking.listing?.owner?.fullName || '',
    start: booking.start.toISOString(),
    end: booking.end.toISOString(),
    days: booking.days,
    total: Number(booking.total),
    delivery: booking.delivery,
    status: booking.status,
    pickupCode: booking.pickupCode,
    returnCode: booking.returnCode,
    createdAt: booking.createdAt.toISOString(),
  };
}

// Shared include clause for booking queries
const bookingInclude = {
  listing: {
    include: { owner: { select: { id: true, fullName: true } } },
  },
};

// Statuses that block a date range from new bookings
const BLOCKING_STATUSES: BookingStatus[] = ['pending', 'approved', 'active'];

// ────────────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────────────
export class BookingsService {

  /**
   * Create a new booking.
   *
   * ANTI-DOUBLE-BOOKING STRATEGY:
   * Uses a PostgreSQL advisory lock scoped to the listing ID inside an
   * interactive Prisma transaction. `pg_advisory_xact_lock` acquires an
   * exclusive session-level lock that is automatically released when the
   * transaction commits or rolls back. Two concurrent booking requests for
   * the same listing will serialize at the lock — the second waits until
   * the first finishes, then runs its overlap check against the updated data.
   *
   * Why advisory locks over alternatives:
   * - Serializable isolation: overkill, can cause spurious retries on unrelated tables
   * - Unique constraint on date ranges: requires schema changes (range type or junction table)
   * - Advisory lock: zero schema changes, explicit, PostgreSQL-native, auto-released
   */
  async createBooking(renterId: string, data: CreateBookingDto) {
    // 1. Fetch the listing (outside transaction — read-only, no lock needed)
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: { owner: { select: { id: true, fullName: true } } },
    });

    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }
    if (listing.status !== ListingStatus.ACTIVE) {
      throw ApiError.badRequest('Listing is not currently available for booking');
    }
    // Prevent owner from booking their own listing
    if (listing.ownerId === renterId) {
      throw ApiError.badRequest('You cannot book your own listing');
    }

    // 2. Compute days and total server-side — NEVER trust client-sent values
    // Convention: days = difference in calendar days (end - start).
    // e.g. Jan 1 → Jan 3 = 2 days (you occupy nights of Jan 1 and Jan 2).
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.ceil((data.end.getTime() - data.start.getTime()) / msPerDay);
    if (days <= 0) {
      throw ApiError.badRequest('End date must be after start date');
    }

    const listingPrice = Number(listing.price);
    const deliveryFee = data.delivery && listing.deliveryFee ? Number(listing.deliveryFee) : 0;
    const total = listingPrice * days + deliveryFee;

    // 3. Check listing's static blockedDates
    const requestedDates = getDateRange(data.start, data.end);
    const blockedSet = new Set(listing.blockedDates);
    const blockedConflict = requestedDates.find((d) => blockedSet.has(d));
    if (blockedConflict) {
      throw ApiError.conflict(`Date ${blockedConflict} is blocked by the listing owner`);
    }

    // 4. Advisory lock + overlap check + insert inside a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Acquire an exclusive advisory lock scoped to this listing.
      // hashtext() converts the UUID string to a stable int4 for pg_advisory_xact_lock.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${data.listingId}))`;

      // Check for overlapping bookings with blocking statuses.
      // Two date ranges [A.start, A.end) and [B.start, B.end) overlap
      // iff A.start < B.end AND A.end > B.start.
      const overlapping = await tx.booking.findFirst({
        where: {
          listingId: data.listingId,
          status: { in: BLOCKING_STATUSES },
          start: { lt: data.end },
          end: { gt: data.start },
        },
      });

      if (overlapping) {
        throw ApiError.conflict('The requested dates overlap with an existing booking');
      }

      // Create the booking
      return tx.booking.create({
        data: {
          listingId: data.listingId,
          renterId,
          start: data.start,
          end: data.end,
          days,
          total,
          delivery: data.delivery,
          status: 'pending',
          pickupCode: generateCode(),
          returnCode: generateCode(),
        },
        include: bookingInclude,
      });
    });

    return toMockBooking(booking);
  }

  /**
   * List bookings for a user, filtered by role.
   */
  async listBookings(userId: string, role: 'renter' | 'owner') {
    // TODO: Add pagination (page/limit query params) when needed
    const where: Prisma.BookingWhereInput =
      role === 'renter'
        ? { renterId: userId }
        : { listing: { ownerId: userId } };

    const bookings = await prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(toMockBooking);
  }

  /**
   * Get a single booking by ID.
   * Only the renter or the listing owner may view it.
   */
  async getBookingById(bookingId: string, requesterId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: bookingInclude,
    });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const isRenter = booking.renterId === requesterId;
    const isOwner = booking.listing?.owner?.id === requesterId;
    if (!isRenter && !isOwner) {
      throw ApiError.forbidden('You do not have access to this booking');
    }

    return toMockBooking(booking);
  }

  /**
   * Update booking status with state machine enforcement.
   *
   * Transition table:
   *   pending  → approved  (owner)
   *   pending  → declined  (owner)
   *   pending  → cancelled (renter)
   *   approved → cancelled (renter)
   *   approved → active    (owner, requires matching pickupCode)
   *   return_pending → completed (owner, requires matching returnCode)
   *
   * The active → return_pending transition is handled by submitReturn() instead.
   */
  async updateStatus(
    bookingId: string,
    requesterId: string,
    dto: UpdateStatusDto
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: bookingInclude,
    });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const isRenter = booking.renterId === requesterId;
    const isOwner = booking.listing?.owner?.id === requesterId;
    if (!isRenter && !isOwner) {
      throw ApiError.forbidden('You do not have access to this booking');
    }

    const { status: newStatus, pickupCode, returnCode } = dto;
    const currentStatus = booking.status;

    // Validate transition + role
    switch (`${currentStatus} → ${newStatus}`) {
      case 'pending → approved':
      case 'pending → declined':
        if (!isOwner) throw ApiError.forbidden('Only the listing owner can approve or decline bookings');
        break;

      case 'pending → cancelled':
      case 'approved → cancelled':
        if (!isRenter) throw ApiError.forbidden('Only the renter can cancel their own booking');
        break;

      case 'approved → active':
        if (!isOwner) throw ApiError.forbidden('Only the listing owner can activate a booking');
        if (!pickupCode || pickupCode !== booking.pickupCode) {
          throw ApiError.badRequest('Invalid pickup code');
        }
        break;

      case 'return_pending → completed':
        if (!isOwner) throw ApiError.forbidden('Only the listing owner can confirm return completion');
        if (!returnCode || returnCode !== booking.returnCode) {
          throw ApiError.badRequest('Invalid return code');
        }
        break;

      default:
        throw ApiError.badRequest(
          `Invalid status transition: "${currentStatus}" → "${newStatus}". ` +
          `Allowed transitions: pending→approved, pending→declined, pending→cancelled, ` +
          `approved→cancelled, approved→active (with pickupCode), return_pending→completed (with returnCode).`
        );
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
      include: bookingInclude,
    });

    return toMockBooking(updated);
  }

  /**
   * Submit a return (renter uploads proof).
   * Transitions active → return_pending.
   */
  async submitReturn(
    bookingId: string,
    requesterId: string,
    dto: SubmitReturnDto,
    photoFile?: Express.Multer.File
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: bookingInclude,
    });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }
    if (booking.renterId !== requesterId) {
      throw ApiError.forbidden('Only the renter can submit a return');
    }
    if (booking.status !== 'active') {
      throw ApiError.badRequest('Return can only be submitted for active bookings');
    }

    // Upload return photo to Supabase Storage if provided
    let returnPhotoUrl: string | undefined;
    if (photoFile) {
      const ext = photoFile.originalname.split('.').pop() || 'jpg';
      const path = `${bookingId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('booking-returns')
        .upload(path, photoFile.buffer, { contentType: photoFile.mimetype });

      if (error) {
        throw ApiError.internal(`Failed to upload return photo: ${error.message}`);
      }

      const { data } = supabase.storage
        .from('booking-returns')
        .getPublicUrl(path);

      returnPhotoUrl = data.publicUrl;
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'return_pending',
        returnNotes: dto.notes || null,
        returnPhoto: returnPhotoUrl || null,
      },
      include: bookingInclude,
    });

    return toMockBooking(updated);
  }

  /**
   * Expire stale bookings: transition pending bookings older than 48 hours to declined.
   *
   * There is no separate 'expired' status in the BookingStatus enum, so we use 'declined'.
   *
   * TODO: Wire this to a scheduled job runner (e.g. node-cron, Supabase Edge Function
   * on a cron schedule, or a pg_cron extension) to run periodically (e.g. every hour).
   * For now this function is exported and can be called manually or from a test.
   */
  async expireStaleBookings(): Promise<number> {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const result = await prisma.booking.updateMany({
      where: {
        status: 'pending',
        createdAt: { lt: cutoff },
      },
      data: { status: 'declined' },
    });

    if (result.count > 0) {
      console.log(`[expireStaleBookings] Declined ${result.count} stale pending booking(s)`);
    }

    return result.count;
  }
}

export const bookingsService = new BookingsService();
