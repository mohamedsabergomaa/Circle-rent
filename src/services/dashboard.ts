import { api } from '../lib/api'

export type OwnerSummary = {
  totalListings: number
  activeListings: number
  activeBookings: number
  completedBookings: number
  totalRevenue: string
}

export type RenterSummary = {
  totalBookings: number
  upcomingBookings: number
  completedBookings: number
  favoritesCount: number
}

export async function getOwnerSummary(): Promise<OwnerSummary> {
  return api<OwnerSummary>('/dashboard/owner/summary')
}

export async function getRenterSummary(): Promise<RenterSummary> {
  return api<RenterSummary>('/dashboard/renter/summary')
}
