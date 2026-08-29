/**
 * Phase 7 Integration Test Script
 * Tests dashboard summaries and admin listing moderation.
 * Seeds its own test data then cleans up.
 * 
 * Run: npx ts-node tests/phase7-test.ts
 */
import { prisma } from '../src/common/config/prisma';
import { generateToken } from '../src/common/config/jwt';
import { config } from '../src/common/config/env';

const BASE_URL = `http://localhost:${config.PORT}`;

async function request(method: string, path: string, token?: string, body?: any) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const data = await res.json();
  return { status: res.status, data };
}

function log(label: string, result: { status: number; data: any }) {
  const icon = result.status < 400 ? '✅' : '❌';
  console.log(`\n${icon} ${label} (HTTP ${result.status})`);
  console.log(JSON.stringify(result.data, null, 2));
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.log(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✓ ${msg}`);
}

async function main() {
  console.log('=== Phase 7 Integration Tests ===\n');

  // Pick two existing users — one as owner, one as renter
  const users = await prisma.user.findMany({ take: 2, select: { id: true, fullName: true } });
  if (users.length < 2) {
    console.log('❌ Need at least 2 users in the DB.');
    return;
  }
  const ownerUser = users[0];
  const renterUser = users[1];
  console.log(`Owner:  ${ownerUser.fullName} (${ownerUser.id})`);
  console.log(`Renter: ${renterUser.fullName} (${renterUser.id})`);

  const ownerToken = generateToken({ userId: ownerUser.id });
  const renterToken = generateToken({ userId: renterUser.id });

  // ──────────────────────────────────────────────
  // Seed test data
  // ──────────────────────────────────────────────
  console.log('\n── Seeding Test Data ──');

  // Create listings: 2 ACTIVE, 1 DRAFT, 1 PAUSED
  const listing1 = await prisma.listing.create({
    data: {
      ownerId: ownerUser.id, name: 'Active Camera', category: 'Electronics',
      price: 100, city: 'Riyadh', image: 'https://ex.com/1.jpg',
      description: 'A camera', condition: 'good', status: 'ACTIVE',
    },
  });
  const listing2 = await prisma.listing.create({
    data: {
      ownerId: ownerUser.id, name: 'Active Drone', category: 'Electronics',
      price: 200, city: 'Jeddah', image: 'https://ex.com/2.jpg',
      description: 'A drone', condition: 'new', status: 'ACTIVE',
    },
  });
  const listing3 = await prisma.listing.create({
    data: {
      ownerId: ownerUser.id, name: 'Draft Laptop', category: 'Electronics',
      price: 50, city: 'Riyadh', image: 'https://ex.com/3.jpg',
      description: 'A laptop', condition: 'fair', status: 'DRAFT',
    },
  });
  const listing4 = await prisma.listing.create({
    data: {
      ownerId: ownerUser.id, name: 'Draft Speaker', category: 'Audio',
      price: 30, city: 'Dammam', image: 'https://ex.com/4.jpg',
      description: 'A speaker', condition: 'good', status: 'DRAFT',
    },
  });
  const listing5 = await prisma.listing.create({
    data: {
      ownerId: ownerUser.id, name: 'Paused Tent', category: 'Outdoor',
      price: 80, city: 'Riyadh', image: 'https://ex.com/5.jpg',
      description: 'A tent', condition: 'good', status: 'PAUSED',
    },
  });
  console.log('  Created 5 listings (2 ACTIVE, 2 DRAFT, 1 PAUSED)');

  // Create bookings on listing1: 1 pending, 1 approved, 1 completed
  const booking1 = await prisma.booking.create({
    data: {
      listingId: listing1.id, renterId: renterUser.id,
      start: new Date('2026-09-01'), end: new Date('2026-09-03'),
      days: 2, total: 200, status: 'pending',
      pickupCode: '111111', returnCode: '222222',
    },
  });
  const booking2 = await prisma.booking.create({
    data: {
      listingId: listing1.id, renterId: renterUser.id,
      start: new Date('2026-09-10'), end: new Date('2026-09-12'),
      days: 2, total: 200, status: 'approved',
      pickupCode: '333333', returnCode: '444444',
    },
  });
  const booking3 = await prisma.booking.create({
    data: {
      listingId: listing2.id, renterId: renterUser.id,
      start: new Date('2026-08-01'), end: new Date('2026-08-05'),
      days: 4, total: 800, status: 'completed',
      pickupCode: '555555', returnCode: '666666',
    },
  });
  // Another completed booking for revenue testing
  const booking4 = await prisma.booking.create({
    data: {
      listingId: listing1.id, renterId: renterUser.id,
      start: new Date('2026-07-01'), end: new Date('2026-07-03'),
      days: 2, total: 200, status: 'completed',
      pickupCode: '777777', returnCode: '888888',
    },
  });
  console.log('  Created 4 bookings (1 pending, 1 approved, 2 completed)');

  // Create a favorite for the renter
  const fav = await prisma.favorite.create({
    data: { userId: renterUser.id, listingId: listing1.id },
  });
  console.log('  Created 1 favorite');

  // ──────────────────────────────────────────────
  // Test Dashboard Endpoints
  // ──────────────────────────────────────────────
  console.log('\n── Dashboard Tests ──');

  const ownerSummary = await request('GET', '/dashboard/owner/summary', ownerToken);
  log('GET /dashboard/owner/summary', ownerSummary);
  assert(ownerSummary.status === 200, 'Owner summary returns 200');
  assert(ownerSummary.data.totalListings === 5, `totalListings = 5 (got ${ownerSummary.data.totalListings})`);
  assert(ownerSummary.data.activeListings === 2, `activeListings = 2 (got ${ownerSummary.data.activeListings})`);
  assert(ownerSummary.data.activeBookings === 2, `activeBookings = 2 (pending+approved) (got ${ownerSummary.data.activeBookings})`);
  assert(ownerSummary.data.completedBookings === 2, `completedBookings = 2 (got ${ownerSummary.data.completedBookings})`);
  assert(ownerSummary.data.totalRevenue === '1000', `totalRevenue = 1000 (200+800) (got ${ownerSummary.data.totalRevenue})`);

  const renterSummary = await request('GET', '/dashboard/renter/summary', renterToken);
  log('GET /dashboard/renter/summary', renterSummary);
  assert(renterSummary.status === 200, 'Renter summary returns 200');
  assert(renterSummary.data.totalBookings === 4, `totalBookings = 4 (got ${renterSummary.data.totalBookings})`);
  assert(renterSummary.data.upcomingBookings === 2, `upcomingBookings = 2 (got ${renterSummary.data.upcomingBookings})`);
  assert(renterSummary.data.completedBookings === 2, `completedBookings = 2 (got ${renterSummary.data.completedBookings})`);
  assert(renterSummary.data.favoritesCount === 1, `favoritesCount = 1 (got ${renterSummary.data.favoritesCount})`);

  // Test unauthorized access (no token)
  const noAuth = await request('GET', '/dashboard/owner/summary');
  log('GET /dashboard/owner/summary (no token)', noAuth);
  assert(noAuth.status === 401, 'No token returns 401');

  // ──────────────────────────────────────────────
  // Test Admin Endpoints — Non-Admin User (expect 403)
  // ──────────────────────────────────────────────
  console.log('\n── Admin Tests (Non-Admin) ──');

  const nonAdminPending = await request('GET', '/admin/listings/pending', renterToken);
  log('GET /admin/listings/pending (non-admin)', nonAdminPending);
  assert(nonAdminPending.status === 403, 'Non-admin gets 403');
  assert(nonAdminPending.data.message === 'Admin access required', `Message: "${nonAdminPending.data.message}"`);

  // ──────────────────────────────────────────────
  // Promote ownerUser to admin
  // ──────────────────────────────────────────────
  console.log('\n── Promoting user to admin ──');
  await prisma.user.update({
    where: { id: ownerUser.id },
    data: { isAdmin: true },
  });
  console.log(`✅ Set isAdmin=true for ${ownerUser.fullName}`);

  // ──────────────────────────────────────────────
  // Test Admin Endpoints — Admin User
  // ──────────────────────────────────────────────
  console.log('\n── Admin Tests (Admin) ──');

  // Verify that DRAFT listings do NOT show up in the pending queue
  const pendingBeforeSubmit = await request('GET', '/admin/listings/pending', ownerToken);
  log('GET /admin/listings/pending (Before Submit)', pendingBeforeSubmit);
  assert(pendingBeforeSubmit.status === 200, 'Admin gets 200');
  assert(pendingBeforeSubmit.data.length === 0, `0 PENDING_REVIEW listings initially (got ${pendingBeforeSubmit.data.length})`);

  // Try approving a DRAFT (should fail)
  const approveDraft = await request('PUT', `/admin/listings/${listing3.id}/approve`, ownerToken);
  log(`PUT /admin/listings/${listing3.id}/approve (DRAFT)`, approveDraft);
  assert(approveDraft.status === 400, 'Approve DRAFT returns 400');

  // Try rejecting a DRAFT (should fail)
  const rejectDraft = await request('PUT', `/admin/listings/${listing4.id}/reject`, ownerToken, { reason: 'fail' });
  log(`PUT /admin/listings/${listing4.id}/reject (DRAFT)`, rejectDraft);
  assert(rejectDraft.status === 400, 'Reject DRAFT returns 400');

  // Submit listing3
  const submitListing3 = await request('PUT', `/listings/${listing3.id}/submit`, ownerToken);
  log(`PUT /listings/${listing3.id}/submit`, submitListing3);
  assert(submitListing3.status === 200, 'Submit listing returns 200');
  assert(submitListing3.data.status === 'PENDING_REVIEW', `Status changed to PENDING_REVIEW (got ${submitListing3.data.status})`);

  // Submit listing4
  const submitListing4 = await request('PUT', `/listings/${listing4.id}/submit`, ownerToken);
  log(`PUT /listings/${listing4.id}/submit`, submitListing4);
  assert(submitListing4.status === 200, 'Submit listing returns 200');
  
  // Verify they now appear in the pending queue
  const pendingListings = await request('GET', '/admin/listings/pending', ownerToken);
  log('GET /admin/listings/pending (After Submit)', pendingListings);
  assert(pendingListings.status === 200, 'Admin gets 200');
  assert(Array.isArray(pendingListings.data), 'Returns array');
  assert(pendingListings.data.length === 2, `2 PENDING_REVIEW listings (got ${pendingListings.data.length})`);
  assert(pendingListings.data[0].owner?.fullName, 'Includes owner info');

  // Test approve
  const approveResult = await request('PUT', `/admin/listings/${listing3.id}/approve`, ownerToken);
  log(`PUT /admin/listings/${listing3.id}/approve`, approveResult);
  assert(approveResult.status === 200, 'Approve returns 200');
  assert(approveResult.data.status === 'ACTIVE', `Status changed to ACTIVE (got ${approveResult.data.status})`);

  // Verify it's no longer in pending list
  const pendingAfterApprove = await request('GET', '/admin/listings/pending', ownerToken);
  assert(pendingAfterApprove.data.length === 1, `Only 1 PENDING_REVIEW listing remaining (got ${pendingAfterApprove.data.length})`);

  // Try approving an already-ACTIVE listing (should fail)
  const doubleApprove = await request('PUT', `/admin/listings/${listing3.id}/approve`, ownerToken);
  log(`PUT /admin/listings/${listing3.id}/approve (already active)`, doubleApprove);
  assert(doubleApprove.status === 400, 'Double approve returns 400');

  // Test reject without reason (validation error)
  const rejectNoReason = await request('PUT', `/admin/listings/${listing4.id}/reject`, ownerToken, {});
  log(`PUT /admin/listings/${listing4.id}/reject (no reason)`, rejectNoReason);
  assert(rejectNoReason.status === 400, 'Reject without reason returns 400');

  // Test reject with valid reason
  const rejectResult = await request('PUT', `/admin/listings/${listing4.id}/reject`, ownerToken, {
    reason: 'Listing does not meet community guidelines',
  });
  log(`PUT /admin/listings/${listing4.id}/reject`, rejectResult);
  assert(rejectResult.status === 200, 'Reject returns 200');
  assert(rejectResult.data.status === 'ARCHIVED', `Status changed to ARCHIVED (got ${rejectResult.data.status})`);
  assert(rejectResult.data.rejectionReason === 'Listing does not meet community guidelines', 'Rejection reason stored');

  // Verify DB state
  const rejectedDB = await prisma.listing.findUnique({
    where: { id: listing4.id },
    select: { status: true, rejectionReason: true },
  });
  console.log('\n  DB verification of rejected listing:', JSON.stringify(rejectedDB));
  assert(rejectedDB?.status === 'ARCHIVED', 'DB status is ARCHIVED');
  assert(rejectedDB?.rejectionReason === 'Listing does not meet community guidelines', 'DB rejectionReason correct');

  // Verify no more pending listings
  const pendingAfterReject = await request('GET', '/admin/listings/pending', ownerToken);
  assert(pendingAfterReject.data.length === 0, `0 PENDING_REVIEW listings remaining (got ${pendingAfterReject.data.length})`);

  // ──────────────────────────────────────────────
  // Cleanup
  // ──────────────────────────────────────────────
  console.log('\n── Cleanup ──');
  await prisma.favorite.delete({ where: { id: fav.id } });
  await prisma.booking.deleteMany({
    where: { id: { in: [booking1.id, booking2.id, booking3.id, booking4.id] } },
  });
  await prisma.listing.deleteMany({
    where: { id: { in: [listing1.id, listing2.id, listing3.id, listing4.id, listing5.id] } },
  });
  await prisma.user.update({
    where: { id: ownerUser.id },
    data: { isAdmin: false },
  });
  console.log('✅ Test data cleaned up');

  console.log('\n=== All Phase 7 Tests Passed ✅ ===');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Test failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
