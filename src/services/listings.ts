import { api } from '../lib/api'
import type { OwnerListing } from '../types'
import type { Listing } from '../App'

export type ListingsParams = {
  q?: string
  category?: string
  city?: string
  priceMin?: number
  priceMax?: number
  rating?: number
  latest?: boolean
  page?: number
  limit?: number
}

export type Review = {
  id: string
  authorName: string
  authorInitial: string
  rating: number
  text: string
  hasPhoto: boolean
  photoUrl?: string
  createdAt: string
}

export async function getListings(params: ListingsParams = {}): Promise<Listing[]> {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.category) query.set('category', params.category)
  if (params.city) query.set('city', params.city)
  if (params.priceMin != null) query.set('priceMin', String(params.priceMin))
  if (params.priceMax != null) query.set('priceMax', String(params.priceMax))
  if (params.rating != null) query.set('rating', String(params.rating))
  if (params.latest) query.set('latest', '1')
  if (params.page != null) query.set('page', String(params.page))
  if (params.limit != null) query.set('limit', String(params.limit))
  return api<Listing[]>(`/listings?${query}`)
}

export async function getListing(id: string): Promise<Listing & { photos: string[]; ownerCity: string }> {
  return api(`/listings/${id}`)
}

export async function getOwnerListings(): Promise<OwnerListing[]> {
  return api<OwnerListing[]>('/listings?mine=true')
}

export async function createListing(data: Omit<OwnerListing, 'id' | 'rating' | 'verified'>): Promise<OwnerListing> {
  return api<OwnerListing>('/listings', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateListing(id: string, data: Partial<OwnerListing>): Promise<OwnerListing> {
  return api<OwnerListing>(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteListing(id: string): Promise<void> {
  return api(`/listings/${id}`, { method: 'DELETE' })
}

export async function getListingReviews(id: string): Promise<Review[]> {
  return api<Review[]>(`/listings/${id}/reviews`)
}

export async function getUnavailableDates(id: string): Promise<string[]> {
  return api<string[]>(`/listings/${id}/availability`)
}
