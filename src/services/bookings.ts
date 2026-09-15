import { api } from "../lib/api"

import type { BookingStatus, MockBooking } from "../types"

export type CreateBookingInput = Omit<MockBooking, "id" | "createdAt" | "status" | "pickupCode" | "returnCode">

export async function getMyBookings(): Promise<MockBooking[]> {
  return api<MockBooking[]>("/bookings?role=renter")
}

export async function getOwnerBookings(): Promise<MockBooking[]> {
  return api<MockBooking[]>("/bookings?role=owner")
}

export async function getBooking(id: string): Promise<MockBooking> {
  return api<MockBooking>(`/bookings/${id}`)
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<MockBooking> {
  return api<MockBooking>("/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<MockBooking> {
  return api<MockBooking>(`/bookings/${id}/status`, {
    method: "PUT",

    body: JSON.stringify({ status }),
  })
}

export async function submitReturn(
  id: string,
  notes: string,
  photo?: File,
): Promise<void> {
  const form = new FormData()

  form.append("notes", notes)

  if (photo) form.append("photo", photo)

  return api(`/bookings/${id}/return`, { method: "PUT", body: form })
}

export const getBookings = getMyBookings
