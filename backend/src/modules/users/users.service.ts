import { prisma } from '../../common/config/prisma';
import { supabase } from '../../common/config/supabase';
import { ApiError } from '../../common/errors/ApiError';
import { UpdateProfileDto } from './users.validation';

export class UsersService {
  async getPublicProfile(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        city: true,
        neighborhood: true,
        createdAt: true,
        bio: true,
        identityVerified: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Compute initials from fullName
    const names = user.fullName.split(' ').filter((n) => n.length > 0);
    const initials =
      names.length >= 2
        ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
        : names.length === 1
        ? names[0].substring(0, 2).toUpperCase()
        : 'UU';

    // Format joined date
    const joined = new Intl.DateTimeFormat('ar-EG', {
      month: 'long',
      year: 'numeric',
    }).format(user.createdAt);
    
    const userListings = await prisma.listing.findMany({
      where: { ownerId: id, status: 'ACTIVE' },
      select: { id: true, name: true, price: true, photos: true }
    });

    return {
      id: user.id,
      name: user.fullName,
      initials,
      city: user.city || 'N/A',
      neighborhood: user.neighborhood || 'N/A',
      joined: `انضم في ${joined}`,
      bio: user.bio || '',
      identityVerified: user.identityVerified,
      // TODO: Aggregate these fields when Ratings, Reviews, Bookings are fully implemented
      rating: 0,
      reviews: 0,
      rentals: 0,
      response: 'يوم واحد',
      responseRate: '١٠٠٪',
      listings: userListings.map(l => ({ id: l.id, title: l.name, price: `${l.price} ج.م / يوم`, image: l.photos[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=640&h=480&fit=crop&auto=format' })),
    };
  }

  async updateProfile(id: string, data: UpdateProfileDto) {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });
    return updatedUser;
  }

  async submitVerification(id: string, identityCard: Express.Multer.File, selfie: Express.Multer.File) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const timestamp = Date.now();
    const identityCardExt = identityCard.originalname.split('.').pop();
    const selfieExt = selfie.originalname.split('.').pop();
    const identityCardPath = `${id}/identity-card-${timestamp}.${identityCardExt}`;
    const selfiePath = `${id}/selfie-${timestamp}.${selfieExt}`;

    // Upload Identity Card
    const { error: idError } = await supabase.storage
      .from('verification-docs')
      .upload(identityCardPath, identityCard.buffer, {
        contentType: identityCard.mimetype,
      });

    if (idError) {
      throw new ApiError(500, 'Failed to upload identity card: ' + idError.message);
    }

    // Upload Selfie
    const { error: selfieError } = await supabase.storage
      .from('verification-docs')
      .upload(selfiePath, selfie.buffer, {
        contentType: selfie.mimetype,
      });

    if (selfieError) {
      throw new ApiError(500, 'Failed to upload selfie: ' + selfieError.message);
    }

    // Save URLs to user
    await prisma.user.update({
      where: { id },
      data: {
        identityCardUrl: identityCardPath,
        selfieUrl: selfiePath,
        // TODO: Admin review flow needed. Keeping identityVerified as false for now.
        identityVerified: false,
      },
    });

    return { message: 'Verification submitted, pending review' };
  }
}

export const usersService = new UsersService();
