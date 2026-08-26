import { prisma } from '../../common/config/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './saved-searches.validation';

export class SavedSearchesService {
  async getSavedSearches(userId: string) {
    const searches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return searches.map((s) => ({
      id: s.id,
      name: s.name,
      query: s.query || '',
      priceRange: s.priceRange || '',
      minimumRating: s.minimumRating,
      location: s.location || '',
      latestOnly: s.latestOnly,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async createSavedSearch(userId: string, data: CreateSavedSearchDto) {
    const search = await prisma.savedSearch.create({
      data: {
        userId,
        name: data.name,
        query: data.query,
        priceRange: data.priceRange,
        minimumRating: data.minimumRating,
        location: data.location,
        latestOnly: data.latestOnly,
      },
    });

    return {
      id: search.id,
      name: search.name,
      query: search.query || '',
      priceRange: search.priceRange || '',
      minimumRating: search.minimumRating,
      location: search.location || '',
      latestOnly: search.latestOnly,
      createdAt: search.createdAt.toISOString(),
    };
  }

  async updateSavedSearch(userId: string, id: string, data: UpdateSavedSearchDto) {
    const search = await prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!search) {
      throw ApiError.notFound('Saved search not found');
    }

    if (search.userId !== userId) {
      throw ApiError.forbidden('Not authorized to update this saved search');
    }

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: { name: data.name },
    });

    return {
      id: updated.id,
      name: updated.name,
      query: updated.query || '',
      priceRange: updated.priceRange || '',
      minimumRating: updated.minimumRating,
      location: updated.location || '',
      latestOnly: updated.latestOnly,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async deleteSavedSearch(userId: string, id: string) {
    const search = await prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!search) {
      throw ApiError.notFound('Saved search not found');
    }

    if (search.userId !== userId) {
      throw ApiError.forbidden('Not authorized to delete this saved search');
    }

    await prisma.savedSearch.delete({
      where: { id },
    });

    return { success: true };
  }
}

export const savedSearchesService = new SavedSearchesService();
