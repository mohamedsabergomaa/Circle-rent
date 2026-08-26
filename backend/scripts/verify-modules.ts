import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/common/config/prisma';
import { generateToken } from '../src/common/config/jwt';
import { ListingStatus, BookingStatus } from '@prisma/client';

async function run() {
  console.log('--- Setting up DB ---');
  // 1. Setup users
  const owner = await prisma.user.create({
    data: {
      fullName: 'Owner Test',
      phoneNumber: '+10000000001',
      phoneVerified: true,
    }
  });
  const ownerToken = generateToken({ userId: owner.id, phoneNumber: owner.phoneNumber });

  const renter = await prisma.user.create({
    data: {
      fullName: 'Renter Test',
      phoneNumber: '+10000000002',
      phoneVerified: true,
    }
  });
  const renterToken = generateToken({ userId: renter.id, phoneNumber: renter.phoneNumber });

  // 2. Setup listing and booking
  const listing = await prisma.listing.create({
    data: {
      ownerId: owner.id,
      name: 'Test Listing',
      category: 'Test',
      price: 100,
      city: 'Test City',
      image: 'http://test.com/img.png',
      description: 'Desc',
      condition: 'New',
      status: ListingStatus.ACTIVE,
    }
  });

  const booking = await prisma.booking.create({
    data: {
      listingId: listing.id,
      renterId: renter.id,
      start: new Date(),
      end: new Date(),
      days: 1,
      total: 100,
      pickupCode: '1234',
      returnCode: '5678',
      status: BookingStatus.completed,
    }
  });

  console.log('--- 1. Messaging Test ---');
  // Create conversation
  let res = await request(app)
    .post('/conversations')
    .set('Authorization', `Bearer ${renterToken}`)
    .send({ listingId: listing.id, ownerId: owner.id });
  console.log('Create Conversation (Renter):', res.status);
  const convId = res.body.id;

  // Send message as renter
  res = await request(app)
    .post(`/conversations/${convId}/messages`)
    .set('Authorization', `Bearer ${renterToken}`)
    .send({ body: 'Hello from renter' });
  console.log('Send Message (Renter):', res.status);

  // Send message as owner
  res = await request(app)
    .post(`/conversations/${convId}/messages`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ body: 'Hello from owner' });
  console.log('Send Message (Owner):', res.status);

  // Check unread count for renter
  res = await request(app)
    .get('/conversations')
    .set('Authorization', `Bearer ${renterToken}`);
  console.log('Get Conversations Unread (Renter before read):', res.body[0].unread);

  // Mark as read for renter
  res = await request(app)
    .put(`/conversations/${convId}/read`)
    .set('Authorization', `Bearer ${renterToken}`);
  console.log('Mark as Read (Renter):', res.status);

  // Check unread count again
  res = await request(app)
    .get('/conversations')
    .set('Authorization', `Bearer ${renterToken}`);
  console.log('Get Conversations Unread (Renter after read):', res.body[0].unread);


  console.log('\n--- 2. Reviews Test ---');
  // Post review as renter (success)
  res = await request(app)
    .post(`/listings/${listing.id}/reviews`)
    .set('Authorization', `Bearer ${renterToken}`)
    .send({ rating: 5, text: 'Great item!' });
  console.log('Post Review (Renter):', res.status, res.body.id ? 'Success' : res.body.message);

  // Post duplicate review (fail)
  res = await request(app)
    .post(`/listings/${listing.id}/reviews`)
    .set('Authorization', `Bearer ${renterToken}`)
    .send({ rating: 4, text: 'Another review' });
  console.log('Post Duplicate Review (Renter):', res.status, res.body.message);

  // Post review as owner without booking (fail)
  res = await request(app)
    .post(`/listings/${listing.id}/reviews`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ rating: 5, text: 'My own item is great' });
  console.log('Post Review without booking (Owner):', res.status, res.body.message);


  console.log('\n--- 3. Favorites Test ---');
  // Add favorite
  res = await request(app)
    .post('/favorites')
    .set('Authorization', `Bearer ${renterToken}`)
    .send({ id: listing.id, name: 'stale data', category: 'stale' }); // Emulate frontend sending stale whole item
  console.log('Add Favorite (Renter):', res.status);

  // Check hydrated data
  res = await request(app)
    .get('/favorites')
    .set('Authorization', `Bearer ${renterToken}`);
  console.log('Get Favorites (Hydrated Name):', res.body[0].name === 'Test Listing' ? 'Fresh data returned' : 'Stale data returned!');

  // Check favorite check endpoint
  res = await request(app)
    .get(`/favorites/${listing.id}/check`)
    .set('Authorization', `Bearer ${renterToken}`);
  console.log('Check Favorite:', res.status, res.body.isFavorite);

  // Duplicate favorite
  res = await request(app)
    .post('/favorites')
    .set('Authorization', `Bearer ${renterToken}`)
    .send({ id: listing.id });
  console.log('Add Duplicate Favorite:', res.status, res.body.message);

  // Delete favorite
  res = await request(app)
    .delete(`/favorites/${listing.id}`)
    .set('Authorization', `Bearer ${renterToken}`);
  console.log('Delete Favorite:', res.status);


  console.log('\n--- 4. Saved Searches Test ---');
  // Create search
  res = await request(app)
    .post('/saved-searches')
    .set('Authorization', `Bearer ${renterToken}`)
    .send({ name: 'My Search' });
  console.log('Create Saved Search:', res.status);
  const searchId = res.body.id;

  // Update search
  res = await request(app)
    .put(`/saved-searches/${searchId}`)
    .set('Authorization', `Bearer ${renterToken}`)
    .send({ name: 'Updated Search' });
  console.log('Update Saved Search:', res.status, res.body.name);

  // Unauth update (owner updates renter's search)
  res = await request(app)
    .put(`/saved-searches/${searchId}`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'Hacked Search' });
  console.log('Unauthorized Update:', res.status, res.body.message);

  // Delete search
  res = await request(app)
    .delete(`/saved-searches/${searchId}`)
    .set('Authorization', `Bearer ${renterToken}`);
  console.log('Delete Saved Search:', res.status);


  // Cleanup
  console.log('\n--- Cleanup ---');
  await prisma.user.deleteMany({ where: { id: { in: [owner.id, renter.id] } } });
  console.log('Test complete. DB cleaned.');
}

run().catch(console.error).finally(() => prisma.$disconnect());
