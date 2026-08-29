import { ListingStatus } from '@prisma/client';
import { prisma } from '../../common/config/prisma';
import { ApiError } from '../../common/errors/ApiError';

export class AdminService {
  /**
   * Get listings pending moderation.
   * Only returns listings with status PENDING_REVIEW.
   */
  async getPendingListings() {
    const listings = await prisma.listing.findMany({
      where: { status: ListingStatus.PENDING_REVIEW },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return listings.map((listing) => ({
      id: listing.id,
      name: listing.name,
      category: listing.category,
      price: listing.price.toString(),
      city: listing.city,
      image: listing.image,
      description: listing.description,
      condition: listing.condition,
      status: listing.status,
      createdAt: listing.createdAt.toISOString(),
      owner: {
        id: listing.owner.id,
        fullName: listing.owner.fullName,
        phoneNumber: listing.owner.phoneNumber,
        email: listing.owner.email,
        city: listing.owner.city,
      },
    }));
  }

  /**
   * Approve a listing — transition from PENDING_REVIEW to ACTIVE.
   */
  async approveListing(listingId: string) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });

    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    if (listing.status !== ListingStatus.PENDING_REVIEW) {
      throw ApiError.badRequest(
        `Cannot approve a listing with status "${listing.status}". Only PENDING_REVIEW listings can be approved.`
      );
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.ACTIVE,
        rejectionReason: null, // Clear any previous rejection reason
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      status: updated.status,
      message: 'Listing approved and now active',
    };
  }

  /**
   * Reject a listing — transition to ARCHIVED and store the reason.
   */
  async rejectListing(listingId: string, reason: string) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });

    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    if (listing.status !== ListingStatus.PENDING_REVIEW) {
      throw ApiError.badRequest(
        `Cannot reject a listing with status "${listing.status}". Only PENDING_REVIEW listings can be rejected.`
      );
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.ARCHIVED,
        rejectionReason: reason,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      status: updated.status,
      rejectionReason: updated.rejectionReason,
      message: 'Listing rejected and archived',
    };
  }
}

export const adminService = new AdminService();
