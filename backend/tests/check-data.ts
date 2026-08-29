import { prisma } from '../src/common/config/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      phoneNumber: true,
      _count: { select: { listings: true, bookings: true, favorites: true } },
    },
  });
  console.log('Users:', JSON.stringify(users, null, 2));

  const listings = await prisma.listing.count();
  const bookings = await prisma.booking.count();
  console.log('Total listings:', listings, 'Total bookings:', bookings);

  await prisma.$disconnect();
}

main();
