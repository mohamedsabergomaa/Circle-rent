import { Prisma, ListingStatus } from '@prisma/client';
import { prisma } from '../../common/config/prisma';
import { supabase } from '../../common/config/supabase';
import { config } from '../../common/config/env';
import { ApiError } from '../../common/errors/ApiError';
import { CreateListingDto, UpdateListingDto, SearchListingsDto } from './listings.validation';

// Helper: map a Prisma Listing (with owner included) to the public Listing shape
function toPublicListing(listing: any) {
  return {
    id: listing.id,
    name: listing.name,
    category: listing.category,
    price: listing.price.toString(),
    city: listing.city,
    image: listing.image,
    owner: listing.owner?.fullName || 'Unknown',
    rating: listing.rating.toString(),
    verified: listing.verified,
    features: listing.features,
  };
}

// Helper: map a Prisma Listing to the OwnerListing shape (fuller detail)
function toOwnerListing(listing: any) {
  return {
    id: listing.id,
    name: listing.name,
    category: listing.category,
    price: listing.price.toString(),
    city: listing.city,
    image: listing.image,
    owner: listing.owner?.fullName || 'Unknown',
    rating: listing.rating.toString(),
    verified: listing.verified,
    description: listing.description,
    condition: listing.condition,
    included: listing.included,
    features: listing.features,
    photos: listing.photos,
    status: listing.status,
    weeklyPrice: listing.weeklyPrice?.toString() || '0',
    monthlyPrice: listing.monthlyPrice?.toString() || '0',
    deposit: listing.deposit?.toString() || '0',
    deliveryFee: listing.deliveryFee?.toString() || '0',
    blockedDates: listing.blockedDates,
  };
}

// Helper: upload photos to Supabase Storage and return public URLs
async function uploadPhotos(
  ownerId: string,
  files: Express.Multer.File[]
): Promise<string[]> {
  const timestamp = Date.now();
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.originalname.split('.').pop() || 'jpg';
    const path = `${ownerId}/${timestamp}-${i}.${ext}`;

    const { error } = await supabase.storage
      .from('listing-photos')
      .upload(path, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new ApiError(500, `Failed to upload photo: ${error.message}`);
    }

    // listing-photos is a public bucket, so we can get the public URL
    const { data } = supabase.storage
      .from('listing-photos')
      .getPublicUrl(path);

    urls.push(data.publicUrl);
  }

  return urls;
}

export class ListingsService {
  /**
   * Public search — only ACTIVE listings, filtered/paginated
   */
  async searchListings(filters: SearchListingsDto) {
    const { q, category, city, priceMin, priceMax, rating, page, limit } = filters;

    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.ACTIVE,
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = category;
    }
    if (city) {
      where.city = city;
    }
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) {
        (where.price as Prisma.DecimalFilter).gte = priceMin;
      }
      if (priceMax !== undefined) {
        (where.price as Prisma.DecimalFilter).lte = priceMax;
      }
    }
    if (rating !== undefined) {
      where.rating = { gte: rating };
    }

    const skip = (page - 1) * limit;

    const listings = await prisma.listing.findMany({
      where,
      include: { owner: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return listings.map(toPublicListing);
  }

  /**
   * Owner's own listings — all statuses
   */
  async getOwnerListings(ownerId: string) {
    const listings = await prisma.listing.findMany({
      where: { ownerId },
      include: { owner: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return listings.map(toOwnerListing);
  }

  /**
   * Single listing by ID.
   * Public users can only see ACTIVE listings.
   * The owner can see their own listing regardless of status.
   */
  async getListingById(id: string, requesterId?: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { owner: { select: { fullName: true, city: true } } },
    });

    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    // If listing is not ACTIVE, only the owner can view it
    if (listing.status !== ListingStatus.ACTIVE && listing.ownerId !== requesterId) {
      throw ApiError.notFound('Listing not found');
    }

    return {
      ...toPublicListing(listing),
      photos: listing.photos,
      description: listing.description,
      condition: listing.condition,
      included: listing.included,
      ownerCity: listing.owner?.city || 'N/A',
      status: listing.status,
      weeklyPrice: listing.weeklyPrice?.toString() || '0',
      monthlyPrice: listing.monthlyPrice?.toString() || '0',
      deposit: listing.deposit?.toString() || '0',
      deliveryFee: listing.deliveryFee?.toString() || '0',
      blockedDates: listing.blockedDates,
    };
  }

  /**
   * Get reviews for a listing.
   * TODO: Implement real review query once the Reviews module is built.
   */
  async getListingReviews(listingId: string) {
    // Verify listing exists
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    const reviews = await prisma.review.findMany({
      where: { listingId },
      include: {
        author: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => ({
      id: review.id,
      authorName: review.author.fullName,
      authorInitial: review.author.fullName.charAt(0).toUpperCase(),
      rating: review.rating,
      text: review.text,
      hasPhoto: !!review.photoUrl,
      photoUrl: review.photoUrl,
      createdAt: review.createdAt.toISOString(),
    }));
  }

  /**
   * Get availability (blocked dates) for a listing.
   * TODO: Eventually also compute blocked dates from active/approved Bookings,
   * not just the static blockedDates field on the Listing model.
   */
  async getListingAvailability(listingId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { blockedDates: true },
    });

    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    return { blockedDates: listing.blockedDates };
  }

  /**
   * Create a new listing.
   * Defaults to DRAFT status — owner must explicitly update to ACTIVE to publish.
   * This prevents half-finished listings from appearing in public search immediately.
   */
  async createListing(
    ownerId: string,
    data: CreateListingDto,
    photos: Express.Multer.File[]
  ) {
    if (photos.length === 0) {
      throw ApiError.badRequest('At least one photo is required');
    }

    const photoUrls = await uploadPhotos(ownerId, photos);

    const listing = await prisma.listing.create({
      data: {
        ownerId,
        name: data.name,
        category: data.category,
        price: data.price,
        city: data.city,
        // Use first photo as the main image
        image: photoUrls[0],
        description: data.description,
        condition: data.condition,
        included: data.included || [],
        features: data.features || [],
        photos: photoUrls,
        // DESIGN DECISION: Default to DRAFT, not ACTIVE.
        // Owner must explicitly publish via PUT /listings/:id with status: "ACTIVE".
        // This prevents incomplete listings from appearing in public search.
        status: ListingStatus.DRAFT,
        weeklyPrice: data.weeklyPrice || null,
        monthlyPrice: data.monthlyPrice || null,
        deposit: data.deposit || null,
        deliveryFee: data.deliveryFee || null,
      },
      include: { owner: { select: { fullName: true } } },
    });

    return toOwnerListing(listing);
  }

  /**
   * Update a listing. Only the owner can update.
   * If new photos are provided, they replace existing photos entirely.
   */
  async updateListing(
    id: string,
    ownerId: string,
    data: UpdateListingDto,
    photos?: Express.Multer.File[]
  ) {
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    if (listing.ownerId !== ownerId) {
      throw ApiError.forbidden('Not authorized to edit this listing');
    }

    const updateData: any = { ...data };

    // If new photos are uploaded, replace entirely
    if (photos && photos.length > 0) {
      const photoUrls = await uploadPhotos(ownerId, photos);
      updateData.photos = photoUrls;
      updateData.image = photoUrls[0];
    }

    // Map status string to enum if provided
    if (updateData.status) {
      updateData.status = ListingStatus[updateData.status as keyof typeof ListingStatus];
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: { owner: { select: { fullName: true } } },
    });

    return toOwnerListing(updated);
  }

  /**
   * Delete a listing. Only the owner can delete.
   *
   * ⚠️ DESIGN DECISION: This is a HARD DELETE.
   * The Prisma schema defines onDelete: Cascade on Booking, Review, Favorite,
   * and Conversation relations. This means deleting a listing will cascade-delete
   * ALL related bookings, reviews, favorites, and conversations.
   *
   * This may need to change to a soft-delete (status = ARCHIVED) in the future
   * if we want to preserve booking/review history for analytics, disputes, etc.
   */
  async deleteListing(id: string, ownerId: string) {
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    if (listing.ownerId !== ownerId) {
      throw ApiError.forbidden('Not authorized to delete this listing');
    }

    await prisma.listing.delete({ where: { id } });

    return { message: 'Listing deleted' };
  }
}

export const listingsService = new ListingsService();
