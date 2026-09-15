export type BookingStatus = "pending" | "approved" | "active" | "completed" | "return_pending" | "declined" | "cancelled"

export type MockBooking = {
  id: string

  listingId: string

  listingName: string

  listingImage: string

  ownerName: string

  start: string

  end: string

  days: number

  total: number

  delivery: boolean

  status: BookingStatus

  pickupCode: string

  returnCode: string

  createdAt: string
}

export type FavoriteItem = {
  id: string
  name: string
  category: string
  price: string
  city: string
  image: string
  owner: string
  rating: string
  savedAt: string
}

export type Message = {
  id: string
  conversationId: string
  sender: "me" | "owner" | "system"
  body: string
  createdAt: string
}

export type Conversation = {
  id: string
  bookingId?: string
  listingName: string
  listingImage: string
  ownerName: string
  ownerInitial: string
  context: string
  unread: number
  updatedAt: string
}

export type OwnerListing = {
  id: string
  name: string
  category: string
  price: string
  city: string
  image: string
  owner: string
  rating: string
  verified: boolean

  description: string
  condition: string
  included: string[]
  features: string[]
  photos: string[]
  status: "نشط" | "موقوف مؤقتًا" | "مسودة" | "مؤرشف"
  weeklyPrice: string
  monthlyPrice: string
  deposit: string
  deliveryFee: string
  insurance: string
  blockedDates: string[]
  version: string
}

export type SavedSearch = {
  id: string
  name: string
  query: string
  priceRange: string
  minimumRating: number
  location: string
  latestOnly: boolean
  createdAt: string
}
