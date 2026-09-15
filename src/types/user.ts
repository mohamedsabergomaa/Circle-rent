export type CityRef = {
  id: string
  nameAr?: string
  nameEn?: string
  lat?: number
  lng?: number
  area?: string
}

export type CircleUser = {
  id: string

  fullName: string

  phoneNumber: string

  email?: string

  avatarUrl?: string

  city?: string

  neighborhood?: string

  bio?: string

  preferredLanguage: "ar"

  phoneVerified: boolean

  identityVerified: boolean

  onboardingCompleted: boolean

  isAdmin: boolean

  memberSince: string

  createdAt: string

  updatedAt: string
}

function cityLabel(city: unknown): string {
  if (!city) return ""
  if (typeof city === "string") return city

  const ref = city as Partial<CityRef>
  return ref.nameAr ?? ref.nameEn ?? ref.id ?? ""
}

export function normalizeUser(raw: CircleUser): CircleUser {
  return {
    ...raw,
    city: cityLabel(raw.city),
  }
}
