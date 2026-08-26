import { prisma } from '../../common/config/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CreateFavoriteDto } from './favorites.validation';

export class FavoritesService {
  async getFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            owner: { select: { fullName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => ({
      id: fav.listing.id,
      name: fav.listing.name,
      category: fav.listing.category,
      price: fav.listing.price.toString(),
      city: fav.listing.city,
      image: fav.listing.image,
      owner: fav.listing.owner?.fullName || 'Unknown',
      rating: fav.listing.rating.toString(),
      savedAt: fav.createdAt.toISOString(),
    }));
  }

  async addFavorite(userId: string, data: CreateFavoriteDto) {
    const listingId = data.id;

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (existing) {
      throw ApiError.conflict('Listing is already in favorites');
    }

    await prisma.favorite.create({
      data: {
        userId,
        listingId,
      },
    });

    return { success: true };
  }

  async removeFavorite(userId: string, listingId: string) {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (!existing) {
      throw ApiError.notFound('Favorite not found');
    }

    await prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    return { success: true };
  }

  async checkFavorite(userId: string, listingId: string) {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    return { isFavorite: !!existing };
  }
}

export const favoritesService = new FavoritesService();
