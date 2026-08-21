# Backend-Ready Refactor

## Context
The entire app runs on localStorage with hardcoded seed data. Backend developers need a clean HTTP service layer, a defined API contract, real auth token handling, proper route guards, and no hardcoded business data leaking through the UI. This refactor replaces every mock/localStorage call with typed service functions that hit REST endpoints, fixes all unguarded routes, and removes critical hardcoding.

---

## 1. API Base Client — `src/lib/api.ts` (new file)

Thin `fetch` wrapper that:
- Reads `VITE_API_URL` from env (`import.meta.env.VITE_API_URL`)
- Attaches `Authorization: Bearer <token>` from `localStorage.getItem('circle_token')`
- Returns typed JSON or throws a structured `ApiError` with `status` + `message`

```ts
export async function api<T>(path: string, init?: RequestInit): Promise<T>
export class ApiError extends Error { status: number }
```

---

## 2. Service Files — `src/services/` (new directory, 7 files)

Each file exports async functions. All functions call `api()`. No localStorage. Signatures define the API contract for the backend team.

### `src/services/auth.ts` (replaces `src/services/authService.ts`)
```ts
signUp(input: SignUpInput): Promise<AuthSession>          // POST /auth/sign-up
signIn(input: SignInInput): Promise<{ otpSent: boolean }> // POST /auth/sign-in
verifyOtp(phoneNumber, code): Promise<AuthSession>        // POST /auth/verify-otp
getSession(): Promise<CircleUser | null>                  // GET  /auth/me
signOut(): Promise<void>                                  // POST /auth/sign-out
completeOnboarding(input): Promise<CircleUser>            // PUT  /auth/onboarding
```
Token stored as `localStorage.setItem('circle_token', session.token)` on signIn/signUp success.

### `src/services/listings.ts`
```ts
getListings(params): Promise<Listing[]>             // GET  /listings
getListing(id): Promise<Listing>                    // GET  /listings/:id
getOwnerListings(): Promise<OwnerListing[]>         // GET  /listings?mine=true
createListing(data): Promise<OwnerListing>          // POST /listings (multipart)
updateListing(id, data): Promise<OwnerListing>      // PUT  /listings/:id
deleteListing(id): Promise<void>                    // DELETE /listings/:id
getListingReviews(id): Promise<Review[]>            // GET  /listings/:id/reviews
getUnavailableDates(id): Promise<string[]>          // GET  /listings/:id/availability
```

### `src/services/bookings.ts`
```ts
getMyBookings(): Promise<MockBooking[]>             // GET  /bookings?role=renter
getOwnerBookings(): Promise<MockBooking[]>          // GET  /bookings?role=owner
getBooking(id): Promise<MockBooking>                // GET  /bookings/:id
createBooking(data): Promise<MockBooking>           // POST /bookings
updateBookingStatus(id, status): Promise<MockBooking> // PUT /bookings/:id/status
submitReturn(id, data): Promise<void>               // PUT  /bookings/:id/return (multipart)
```

### `src/services/messages.ts`
```ts
getConversations(): Promise<Conversation[]>         // GET  /conversations
getMessages(conversationId): Promise<Message[]>     // GET  /conversations/:id/messages
sendMessage(conversationId, text): Promise<Message> // POST /conversations/:id/messages
ensureConversation(listingId, ownerId): Promise<Conversation> // POST /conversations
markRead(conversationId): Promise<void>             // PUT  /conversations/:id/read
```

### `src/services/favorites.ts`
```ts
getFavorites(): Promise<FavoriteItem[]>             // GET  /favorites
addFavorite(item): Promise<void>                    // POST /favorites
removeFavorite(id): Promise<void>                   // DELETE /favorites/:id
isFavorite(id): Promise<boolean>                    // GET  /favorites/:id/check
```

### `src/services/savedSearches.ts`
```ts
getSavedSearches(): Promise<SavedSearch[]>          // GET  /saved-searches
createSavedSearch(data): Promise<SavedSearch>       // POST /saved-searches
updateSavedSearch(id, name): Promise<SavedSearch>   // PUT  /saved-searches/:id
deleteSavedSearch(id): Promise<void>                // DELETE /saved-searches/:id
```

### `src/services/users.ts`
```ts
getPublicProfile(userId): Promise<PublicUser>       // GET  /users/:id
updateProfile(data): Promise<CircleUser>            // PUT  /users/me
submitVerification(data): Promise<void>             // POST /users/me/verification (multipart)
```

---

## 3. Environment Configuration

Add `src/vite-env.d.ts` extension (or update existing):
```ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}
```

Add `.env.example` at project root:
```
VITE_API_URL=https://api.circle.example/v1
```

---

## 4. Auth Context — `src/context/AuthContext.tsx`

- Replace all `authService.*` (old) calls with new `src/services/auth.ts` functions
- `getSession()` → `GET /auth/me` using stored token; on 401, clears token and sets `user = null`
- `signIn` now becomes two-step: call `signIn()` → navigate to OTP screen → `verifyOtp()` resolves the session
- Exports `token` alongside `user` so service layer can use it

---

## 5. Route Guards — `src/App.tsx`

Create a reusable `<AuthRoute>` wrapper (analogous to existing `DashboardGate`):
```tsx
function AuthRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  return <>{children}</>
}
```

Apply `<AuthRoute>` to all currently-unguarded private routes:
`/checkout`, `/my-bookings`, `/my-bookings/:id`, `/my-bookings/:id/return`,
`/dashboard/bookings`, `/create-listing`, `/messages`, `/profile`,
`/favorites`, `/saved-searches`

---

## 6. Fix Critical Hardcoding

### `src/pages/Checkout.tsx`
- Remove hardcoded `300 * days` price → read `dailyPrice` from listing query param (already passed as URL param, just not used)
- Remove hardcoded owner `'مروان'` → read from listing data
- Remove hardcoded order number `CR-{year}-1048` → use `booking.id` returned by `createBooking()`
- Remove hardcoded location `'الرياض · حي النخيل'` → read from listing city

### `src/App.tsx` — `ProductPage`
- Replace hardcoded `productGallery` array with `listing.photos` from API (`getListing(id)`)
- Replace hardcoded `unavailable` dates with `getUnavailableDates(id)` response
- Replace hardcoded reviews with `getListingReviews(id)` response
- Replace hardcoded owner stats (27 rentals, 92% acceptance, etc.) with real user data

### `src/pages/Profiles.tsx` — `PublicProfile`
- Replace `const profile = userId === 'marwan' ? owner : owner` with `getPublicProfile(userId)` call
- Load real listings for the profile owner

### `src/pages/Dashboard.tsx`
- Replace `initialListings` and `initialRequests` hardcoded arrays with `getOwnerListings()` and `getOwnerBookings()` calls
- Earnings tab: replace hardcoded numbers with real data from `GET /bookings?role=owner&summary=true`

### `src/pages/AuthLayout.tsx` — `PhoneField`
- Remove hardcoded `+966` Saudi prefix — make it dynamic based on the `CountrySelect` value (already stored in `Header`'s `CountrySelect` component; lift state or read from context)

### `src/pages/Onboarding.tsx`
- Replace Saudi-only city list with Egyptian cities (to match the rest of the app): `['القاهرة', 'الجيزة', 'الإسكندرية', 'المعادي', 'مدينة نصر', '٦ أكتوبر', 'الزمالك']`

---

## 7. Image Upload

### `src/pages/CreateListing.tsx` and `src/pages/Dashboard.tsx`
- Replace `URL.createObjectURL(file)` (blob URLs) with an upload helper:
```ts
// src/lib/uploadImage.ts
export async function uploadImage(file: File): Promise<string>
// POST /uploads → returns { url: string }
```
- Call this before form submission; use returned URL in listing payload

---

## Files Modified
- `src/lib/api.ts` — new
- `src/lib/uploadImage.ts` — new
- `src/services/auth.ts` — rewrite of `src/services/authService.ts`
- `src/services/listings.ts` — new (replaces `src/lib/mockOwnerListings.ts`)
- `src/services/bookings.ts` — new (replaces `src/lib/mockBookings.ts`)
- `src/services/messages.ts` — new (replaces `src/lib/mockMessages.ts`)
- `src/services/favorites.ts` — new (replaces `src/lib/mockFavorites.ts`)
- `src/services/savedSearches.ts` — new (replaces `src/lib/mockSavedSearches.ts`)
- `src/services/users.ts` — new
- `src/context/AuthContext.tsx` — updated
- `src/App.tsx` — `AuthRoute` component + apply to 10 routes + `ProductPage` fixes
- `src/pages/Checkout.tsx` — remove hardcoding
- `src/pages/Profiles.tsx` — fix PublicProfile
- `src/pages/Dashboard.tsx` — replace initialListings/initialRequests
- `src/pages/Onboarding.tsx` — fix city list
- `src/pages/AuthLayout.tsx` — fix phone prefix
- `src/pages/CreateListing.tsx` — real image upload
- `.env.example` — new

## Verification
- Auth flow: sign up → OTP → onboarding → dashboard; all service calls go to `VITE_API_URL` (network tab shows real requests, or 404s if backend not yet live)
- Private routes (`/checkout`, `/messages`, etc.) redirect to `/login` when unauthenticated
- `ProductPage` renders gallery/dates/reviews from API response (or loading state if backend not live)
- `PublicProfile` uses `userId` param correctly
- Checkout order number comes from `createBooking()` response, not hardcoded
- `.env.example` present and `VITE_API_URL` documented
