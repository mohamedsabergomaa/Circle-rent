import { api } from "../lib/api"

import type { CircleUser } from "../types/user"
import { normalizeUser } from "../types/user"

export type PublicUser = {
  id: string

  name: string

  initials: string

  city: string

  neighborhood: string

  joined: string

  bio: string

  rating: number

  reviews: number

  rentals: number

  response: string

  responseRate: string

  identityVerified: boolean

  listings: Array<{ id: string title: string price: string image: string }>
}

export type UpdateProfileInput = Pick<CircleUser, "fullName" | "city" | "neighborhood" | "bio" | "avatarUrl">

export async function getPublicProfile(userId: string): Promise<PublicUser> {
  return api<PublicUser>(`/users/${userId}`)
}

export async function updateProfile(
  data: Partial<UpdateProfileInput>,
): Promise<CircleUser> {
  const user = await api<CircleUser>("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  })

  return normalizeUser(user)
}

export async function submitVerification(identityCard: File): Promise<void> {
  const form = new FormData()

  form.append("identityCard", identityCard)

  return api("/users/me/verification", { method: "POST", body: form })
}
