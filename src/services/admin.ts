import { api } from "../lib/api"

export type AdminUser = {
  id: string

  name: string

  phone: string

  city: string

  status: "active" | "suspended"

  verified: boolean

  listingCount: number

  joinedAt: string

  avatar: string
}

export type AdminListing = {
  id: string

  name: string

  category: string

  owner: string

  ownerId: string

  price: number

  city: string

  status: "active" | "pending" | "rejected"

  rating: number

  image: string

  createdAt: string
}

export type AdminBooking = {
  id: string

  listingName: string

  renterName: string

  ownerName: string

  startDate: string

  endDate: string

  total: number

  status: "completed" | "active" | "pending" | "cancelled"
}

export type AdminReport = {
  id: string

  type: "listing" | "user"

  targetId: string

  targetName: string

  reporterName: string

  reason: string

  reportedAt: string

  status: "pending" | "resolved"
}

export type AdminStats = {
  totalUsers: number

  activeListings: number

  bookingsThisMonth: number

  revenueThisMonth: number

  usersDelta: number

  listingsDelta: number

  bookingsDelta: number

  revenueDelta: number
}

export type AdminListUsersParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export type AdminListListingsParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export type AdminListBookingsParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export type AdminListReportsParams = {
  page?: number
  limit?: number
  status?: string
}

export type PaginatedResult<T,> = {
  items: T[]
  total: number
  page: number
  pages: number
}

export function getAdminStats(): Promise<AdminStats> {
  return api<AdminStats>("/admin/stats")
}

export function listAdminUsers(
  params: AdminListUsersParams = {},
): Promise<PaginatedResult<AdminUser>> {
  const q = new URLSearchParams(params as Record<string, string>)

  return api<PaginatedResult<AdminUser>>(`/admin/users?${q}`)
}

export function suspendUser(id: string): Promise<AdminUser> {
  return api<AdminUser>(`/admin/users/${id}/suspend`, { method: "PUT" })
}

export function activateUser(id: string): Promise<AdminUser> {
  return api<AdminUser>(`/admin/users/${id}/activate`, { method: "PUT" })
}

export function deleteUser(id: string): Promise<void> {
  return api<void>(`/admin/users/${id}`, { method: "DELETE" })
}

export function listAdminListings(
  params: AdminListListingsParams = {},
): Promise<PaginatedResult<AdminListing>> {
  const q = new URLSearchParams(params as Record<string, string>)

  return api<PaginatedResult<AdminListing>>(`/admin/listings?${q}`)
}

export function approveListing(id: string): Promise<AdminListing> {
  return api<AdminListing>(`/admin/listings/${id}/approve`, { method: "PUT" })
}

export function rejectListing(id: string): Promise<AdminListing> {
  return api<AdminListing>(`/admin/listings/${id}/reject`, { method: "PUT" })
}

export function deleteListing(id: string): Promise<void> {
  return api<void>(`/admin/listings/${id}`, { method: "DELETE" })
}

export function listAdminBookings(
  params: AdminListBookingsParams = {},
): Promise<PaginatedResult<AdminBooking>> {
  const q = new URLSearchParams(params as Record<string, string>)

  return api<PaginatedResult<AdminBooking>>(`/admin/bookings?${q}`)
}

export function listAdminReports(
  params: AdminListReportsParams = {},
): Promise<PaginatedResult<AdminReport>> {
  const q = new URLSearchParams(params as Record<string, string>)

  return api<PaginatedResult<AdminReport>>(`/admin/reports?${q}`)
}

export function resolveReport(id: string): Promise<AdminReport> {
  return api<AdminReport>(`/admin/reports/${id}/resolve`, { method: "PUT" })
}

export function deleteReport(id: string): Promise<void> {
  return api<void>(`/admin/reports/${id}`, { method: "DELETE" })
}
