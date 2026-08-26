import { prisma } from '../../common/config/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CreateReviewDto } from './reviews.validation';
import { BookingStatus } from '@prisma/client';

export class ReviewsService {
  async createReview(userId: string, listingId: string, data: CreateReviewDto) {
    // Verify listing exists
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    // Check if user has a completed booking for this exact listing
    const completedBooking = await prisma.booking.findFirst({
      where: {
        renterId: userId,
        listingId: listingId,
        status: BookingStatus.completed,
      },
    });

    if (!completedBooking) {
      throw ApiError.forbidden('You can only review listings you have completely rented');
    }

    // Check if user has already reviewed this listing
    const existingReview = await prisma.review.findFirst({
      where: {
        authorId: userId,
        listingId: listingId,
      },
    });

    if (existingReview) {
      throw ApiError.badRequest('You have already reviewed this listing');
    }

    // Insert review
    const review = await prisma.review.create({
      data: {
        listingId,
        authorId: userId,
        rating: data.rating,
        text: data.text,
        photoUrl: data.photoUrl,
      },
      include: {
        author: { select: { fullName: true } },
      },
    });

    // Update listing's average rating
    const allReviews = await prisma.review.findMany({
      where: { listingId },
      select: { rating: true },
    });
    
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await prisma.listing.update({
      where: { id: listingId },
      data: { rating: avgRating },
    });

    return {
      id: review.id,
      authorName: review.author.fullName,
      authorInitial: review.author.fullName.charAt(0).toUpperCase(),
      rating: review.rating,
      text: review.text,
      hasPhoto: !!review.photoUrl,
      photoUrl: review.photoUrl,
      createdAt: review.createdAt.toISOString(),
    };
  }
}

export const reviewsService = new ReviewsService();
