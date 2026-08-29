import { prisma } from '../../common/config/prisma';

export class DashboardService {
  /**
   * Owner dashboard summary.
   * Uses Prisma count() and aggregate() to compute stats at the DB level.
   */
  async getOwnerSummary(ownerId: string) {
    // Count listings by status in a single groupBy query
    const listingCounts = await prisma.listing.groupBy({
      by: ['status'],
      where: { ownerId },
      _count: { id: true },
    });

    const totalListings = listingCounts.reduce((sum, g) => sum + g._count.id, 0);
    const activeListings = listingCounts.find((g) => g.status === 'ACTIVE')?._count.id || 0;

    // Count bookings on this owner's listings by status
    const bookingCounts = await prisma.booking.groupBy({
      by: ['status'],
      where: { listing: { ownerId } },
      _count: { id: true },
    });

    const activeBookingStatuses = ['pending', 'approved', 'active'];
    const activeBookings = bookingCounts
      .filter((g) => activeBookingStatuses.includes(g.status))
      .reduce((sum, g) => sum + g._count.id, 0);

    const completedBookings = bookingCounts.find((g) => g.status === 'completed')?._count.id || 0;

    // Sum total revenue from completed bookings using Prisma aggregate
    const revenueResult = await prisma.booking.aggregate({
      where: {
        listing: { ownerId },
        status: 'completed',
      },
      _sum: { total: true },
    });

    const totalRevenue = revenueResult._sum.total?.toString() || '0';

    return {
      totalListings,
      activeListings,
      activeBookings,
      completedBookings,
      totalRevenue,
    };
  }

  /**
   * Renter dashboard summary.
   */
  async getRenterSummary(renterId: string) {
    // Count bookings by status in a single groupBy query
    const bookingCounts = await prisma.booking.groupBy({
      by: ['status'],
      where: { renterId },
      _count: { id: true },
    });

    const totalBookings = bookingCounts.reduce((sum, g) => sum + g._count.id, 0);

    const upcomingStatuses = ['pending', 'approved', 'active'];
    const upcomingBookings = bookingCounts
      .filter((g) => upcomingStatuses.includes(g.status))
      .reduce((sum, g) => sum + g._count.id, 0);

    const completedBookings = bookingCounts.find((g) => g.status === 'completed')?._count.id || 0;

    // Count favorites
    const favoritesCount = await prisma.favorite.count({
      where: { userId: renterId },
    });

    return {
      totalBookings,
      upcomingBookings,
      completedBookings,
      favoritesCount,
    };
  }
}

export const dashboardService = new DashboardService();
