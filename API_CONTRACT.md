# API Contract - Circle

This document serves as the single source of truth for the backend team to build the API for the "سيركل — Circle" frontend. It covers all endpoints, schemas, authentication flows, business logic hints, and identified gaps.

## 1. Full Endpoint Inventory

### Auth
| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/sign-up` | No | Register new user. Body: `SignUpInput`. Returns: `AuthSession`. |
| `POST` | `/auth/sign-in` | No | Send OTP for login. Body: `SignInInput`. Returns: `{ otpSent: boolean }`. |
| `POST` | `/auth/verify-otp` | No | Verify OTP. Body: `{ phoneNumber: string, code: string }`. Returns: `AuthSession`. |
| `GET` | `/auth/me` | Yes | Fetch authenticated user details. Returns: `CircleUser`. |
| `POST` | `/auth/sign-out` | Yes | Invalidate current session/token. |
| `PUT` | `/auth/onboarding` | Yes | Complete profile setup. Body: `OnboardingInput`. Returns: `AuthSession`. |

### Users & Verification
| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/users/:id` | No | Fetch public user profile. Returns: `PublicUser`. |
| `PUT` | `/users/me` | Yes | Update own profile. Body: `Partial<UpdateProfileInput>`. Returns: `CircleUser`. |
| `POST` | `/users/me/verification`| Yes | Submit ID verification. Body: `FormData` (phoneNumber, identityCard file, selfie file). |

### Listings
| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/listings` | No | Search listings. Query: `q`, `category`, `city`, `priceMin`, `priceMax`, `rating`, `latest`, `page`, `limit`. Returns: `Listing[]`. |
| `GET` | `/listings?mine=true` | Yes | Get owner's listings. Returns: `OwnerListing[]`. |
| `GET` | `/listings/:id` | No | Get listing detail. Returns: `Listing & { photos: string[]; ownerCity: string }`. |
| `POST` | `/listings` | Yes | Create listing. Body: `Omit<OwnerListing, 'id' \| 'rating' \| 'verified'>`. Returns: `OwnerListing`. |
| `PUT` | `/listings/:id` | Yes | Update listing. Body: `Partial<OwnerListing>`. Returns: `OwnerListing`. |
| `DELETE`| `/listings/:id` | Yes | Delete a listing. |
| `GET` | `/listings/:id/reviews` | No | Get reviews for a listing. Returns: `Review[]`. |
| `GET` | `/listings/:id/availability`| No | Get blocked dates. Returns: `string[]` (YYYY-MM-DD). |

### Bookings
| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/bookings?role=renter` | Yes | List user's outgoing bookings. Returns: `MockBooking[]`. |
| `GET` | `/bookings?role=owner` | Yes | List owner's incoming bookings. Returns: `MockBooking[]`. |
| `GET` | `/bookings/:id` | Yes | Get single booking. Returns: `MockBooking`. |
| `POST` | `/bookings` | Yes | Create a booking. Body: `CreateBookingInput`. Returns: `MockBooking`. |
| `PUT` | `/bookings/:id/status` | Yes | Update status (e.g. approve/decline/cancel). Body: `{ status: BookingStatus }`. Returns: `MockBooking`. |
| `PUT` | `/bookings/:id/return` | Yes | Confirm return. Body: `FormData` (notes string, photo file). |

### Messaging
| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/conversations` | Yes | List conversations. Returns: `Conversation[]`. |
| `POST` | `/conversations` | Yes | Create/ensure conversation. Body: `{ listingId, ownerId }`. Returns: `Conversation`. |
| `GET` | `/conversations/:conversationId/messages` | Yes | List messages. Returns: `Message[]`. |
| `POST` | `/conversations/:conversationId/messages` | Yes | Send message. Body: `{ body: string }`. Returns: `Message`. |
| `PUT` | `/conversations/:conversationId/read` | Yes | Mark conversation as read. |

### Favorites & Saved Searches
| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/favorites` | Yes | List favorites. Returns: `FavoriteItem[]`. |
| `POST` | `/favorites` | Yes | Add favorite. Body: `Omit<FavoriteItem, 'savedAt'>`. |
| `DELETE`| `/favorites/:id` | Yes | Remove favorite. |
| `GET` | `/favorites/:id/check` | Yes | Check if favorite exists. Returns: `{ isFavorite: boolean }`. |
| `GET` | `/saved-searches` | Yes | List saved searches. Returns: `SavedSearch[]`. |
| `POST` | `/saved-searches` | Yes | Create saved search. Body: `Omit<SavedSearch, 'id' \| 'createdAt'>`. Returns: `SavedSearch`. |
| `PUT` | `/saved-searches/:id` | Yes | Update search name. Body: `{ name: string }`. Returns: `SavedSearch`. |
| `DELETE`| `/saved-searches/:id` | Yes | Delete saved search. |

---

## 2. TypeScript Interfaces / DTOs

These must match exactly field-for-field.

```typescript
export type BookingStatus = 'pending' | 'approved' | 'active' | 'completed' | 'return_pending' | 'declined' | 'cancelled';

export type MockBooking = {
  id: string;
  listingId: string;
  listingName: string;
  listingImage: string;
  ownerName: string;
  start: string;
  end: string;
  days: number;
  total: number;
  delivery: boolean;
  status: BookingStatus;
  pickupCode: string;
  returnCode: string;
  createdAt: string;
};

export type CreateBookingInput = Omit<MockBooking, 'id' | 'createdAt' | 'status' | 'pickupCode' | 'returnCode'>;

export type FavoriteItem = { id: string; name: string; category: string; price: string; city: string; image: string; owner: string; rating: string; savedAt: string; };

export type Message = { id: string; conversationId: string; sender: 'me' | 'owner' | 'system'; body: string; createdAt: string; };

export type Conversation = { id: string; bookingId?: string; listingName: string; listingImage: string; ownerName: string; ownerInitial: string; context: string; unread: number; updatedAt: string; };

export type OwnerListing = {
  id: string; name: string; category: string; price: string; city: string; image: string; owner: string; rating: string; verified: boolean;
  description: string; condition: string; included: string[]; features: string[]; photos: string[]; status: 'نشط' | 'موقوف مؤقتًا' | 'مسودة' | 'مؤرشف'; weeklyPrice: string; monthlyPrice: string; deposit: string; deliveryFee: string; blockedDates: string[];
};

export type Listing = {
  id: string; name: string; category: string; price: string; city: string; image: string; owner: string; rating: string; verified?: boolean; features?: string[];
};

export type SavedSearch = { id: string; name: string; query: string; priceRange: string; minimumRating: number; location: string; latestOnly: boolean; createdAt: string; };

export type CircleUser = {
  id: string; fullName: string; phoneNumber: string; email?: string; avatarUrl?: string; city?: string; neighborhood?: string; bio?: string; preferredLanguage: 'ar'; phoneVerified: boolean; identityVerified: boolean; onboardingCompleted: boolean; memberSince: string; createdAt: string; updatedAt: string;
};

export type PublicUser = {
  id: string; name: string; initials: string; city: string; neighborhood: string; joined: string; bio: string; rating: number; reviews: number; rentals: number; response: string; responseRate: string; identityVerified: boolean; listings: Array<{ id: string; title: string; price: string; image: string }>;
};

export type AuthSession = { user: CircleUser; token: string; createdAt: string; };
export type SignUpInput = { fullName: string; phoneNumber: string; email?: string; };
export type SignInInput = { phoneNumber: string; };
export type OnboardingInput = Pick<CircleUser, 'city' | 'neighborhood' | 'bio' | 'avatarUrl'>;
export type UpdateProfileInput = Pick<CircleUser, 'fullName' | 'city' | 'neighborhood' | 'bio' | 'avatarUrl'>;
export type Review = { id: string; authorName: string; authorInitial: string; rating: number; text: string; hasPhoto: boolean; photoUrl?: string; createdAt: string; };
```

---

## 3. Auth Flow Detail

1. **OTP Request**: User submits phone number to `/auth/sign-in`. The backend should dispatch an SMS and return `{ otpSent: true }`.
2. **OTP Verification**: User enters code, frontend sends `{ phoneNumber, code }` to `/auth/verify-otp`.
3. **Token Storage**: On success, the frontend expects an `AuthSession` with a `token`. This token is stored in `localStorage` as `circle_token`.
4. **Attaching Token**: `src/lib/api.ts` checks `localStorage` and automatically attaches `Authorization: Bearer <token>` to all outgoing requests.
5. **Handling 401/Errors**: The `api.ts` wrapper throws an `ApiError` if the response is not `ok`. During initial app load (`getSession` in `auth.ts`), if the `/auth/me` request fails (e.g. 401 Unauthorized), the frontend clears the token (`localStorage.removeItem('circle_token')`) and sets the user state to `null`, effectively logging them out.

---

## 4. Business Logic Hints from the UI

- **Listings / Bookings / Checkout**:
  - A booking involves calculated `total`, `days`, `delivery` preference, and dates (`start`, `end`).
  - Prices are currently formatted as Arabic numerals/strings in the frontend (e.g. `'٣٠٠'`), but converted to numbers internally or expected as numerical strings. The backend should handle parsing or enforce a numerical schema.
  - The UI uses `FormData` for ID verification (images) and Rental Returns (photos), so the backend must accept `multipart/form-data` on `/users/me/verification` and `/bookings/:id/return`.
- **Search Filters**:
  - `priceRange` has string enum values on the client: `'any'`, `'under-150'`, `'150-250'`, `'over-250'`. But the API request sends `priceMin` and `priceMax` as explicit numbers.
  - `rating` sends an explicit number (e.g., `4`, `4.5`).
- **Dates**:
  - Blocked dates for the calendar are fetched from `/listings/:id/availability`. These are expected as an array of date strings (`YYYY-MM-DD`).

---

## 5. Gaps and Ambiguities

1. **Booking Creation Payload**: The frontend's `CreateBookingInput` extends `MockBooking` minus a few fields. This means the frontend is sending fields like `listingName`, `listingImage`, `ownerName`, and `total` to the backend. The backend should ideally calculate `total` securely on its side and disregard these redundant fields, or the `CreateBookingInput` type needs to be refactored to only send IDs, dates, and choices (like `delivery: boolean`).
2. **Favorites Creation**: The frontend sends the entire listing shape to `/favorites` (`name, category, price, city, image, owner, rating`). The backend should just take `listingId` and derive the rest from its database, but if it follows the DTO verbatim it will be storing duplicate data.
3. **No error responses specified**: The frontend's `ApiError` extracts a `message` from the JSON body (`body?.message`). The backend should standardize error responses to `{ "message": "Human readable string" }`.

---

## 6. Status Enums

The backend must exactly match these string values:

**BookingStatus**:
- `'pending'`
- `'approved'`
- `'active'`
- `'completed'`
- `'return_pending'`
- `'declined'`
- `'cancelled'`

**Listing Status (Arabic strings directly in codebase)**:
- `'نشط'` (Active)
- `'موقوف مؤقتًا'` (Paused)
- `'مسودة'` (Draft)
- `'مؤرشف'` (Archived)

**Message Senders**:
- `'me'`
- `'owner'`
- `'system'`

**Language**:
- `'ar'` (for `preferredLanguage`)
