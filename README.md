# سيركل — Circle

A peer-to-peer rental marketplace for Arabic-speaking communities. Owners list items they want to rent out; renters discover and book them locally. Built with React 19, Vite 8, and Tailwind CSS v4.

---

## Features

- **Browse & Search** — full-text search with category filters and city scoping
- **Listings** — detailed product pages with availability calendar, pricing, and reviews
- **Checkout flow** — date selection, delivery toggle, itemised price breakdown
- **OTP Authentication** — phone-number login with SMS verification and JWT token handling
- **Owner Dashboard** — manage listings, track bookings, and confirm returns
- **Renter Bookings** — timeline view of all active, pending, and past rentals
- **Messaging** — in-app chat tied to individual booking requests
- **Profiles** — public user profiles with reviews and verified badges
- **Favorites & Saved Searches** — persist across sessions
- **Verification flow** — ID verification with pending/approved states
- **Policy & Terms** — full Arabic platform policy at `/policy`
- **RTL-first UI** — every screen is designed right-to-left in Arabic

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Routing | React Router v8 |
| Styling | Tailwind CSS v4 (Vite plugin, no config file) |
| Icons | Lucide React |
| Build | Vite 8 |
| Language | TypeScript 5.7 |
| Fonts | IBM Plex Sans Arabic, Amiri, Noto Naskh Arabic, Nunito |
| Formatter | oxfmt |

---

## Project Structure

```
src/
├── App.tsx              # Router, Header, Footer, HomePage, SearchResultsPage, ProductPage
├── Logo.tsx             # Brand mark component
├── index.css            # Tailwind import + global tokens + font wiring
├── main.tsx             # React entry point
├── lib/
│   └── api.ts           # HTTP client — attaches Bearer token, throws ApiError
├── services/
│   ├── auth.ts          # login, verifyOtp, signOut, getMe
│   ├── listings.ts      # getListing, searchListings, createListing, ...
│   ├── bookings.ts      # getBookings, createBooking, confirmReturn, ...
│   ├── favorites.ts     # getFavorites, addFavorite, removeFavorite
│   ├── messages.ts      # getConversations, getMessages, sendMessage
│   ├── savedSearches.ts # getSavedSearches, saveSearch, deleteSearch
│   └── users.ts         # getUser, updateProfile, uploadAvatar
├── types/
│   └── index.ts         # Shared TypeScript interfaces
└── pages/
    ├── AuthLayout.tsx        # Shared layout for login / signup screens
    ├── Login.tsx             # Phone + OTP login
    ├── SignUp.tsx            # Registration
    ├── PhoneVerification.tsx # OTP entry screen
    ├── Onboarding.tsx        # Post-signup profile setup
    ├── Checkout.tsx          # Booking confirmation & payment summary
    ├── MyBookings.tsx        # Renter booking list + detail
    ├── OwnerBookings.tsx     # Owner booking management
    ├── RentalReturn.tsx      # Return confirmation flow
    ├── Dashboard.tsx         # Owner dashboard
    ├── CreateListing.tsx     # New listing form
    ├── Messages.tsx          # In-app messaging
    ├── Profiles.tsx          # Public & private profile views
    ├── Favorites.tsx         # Saved listings
    ├── SavedSearches.tsx     # Saved search queries
    ├── Verification.tsx      # ID verification
    └── InfoPages.tsx         # About, How It Works, FAQ, Contact, Policy
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (or npm / yarn)

### Install

```bash
pnpm install
```

### Environment

Create a `.env.local` file in the project root:

```env
VITE_API_URL=https://your-backend.example.com
```

Leave `VITE_API_URL` empty during local development — the client will fall back to relative paths and surface clear errors when the backend is unavailable.

### Develop

```bash
pnpm dev
```

App runs at `http://localhost:5173` with hot module replacement.

### Build

```bash
pnpm build
```

Output goes to `dist/`. Preview the production build:

```bash
pnpm preview
```

---

## API Contract

The frontend expects a REST API at `VITE_API_URL`. All endpoints require a `Bearer` token in the `Authorization` header (except auth endpoints). The token is stored in `localStorage` under the key `circle_token`.

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/send-otp` | Send OTP to phone number |
| `POST` | `/auth/verify-otp` | Verify OTP → returns `{ token }` |
| `GET` | `/auth/me` | Fetch authenticated user |
| `POST` | `/auth/sign-out` | Invalidate token |

### Listings

| Method | Path | Description |
|---|---|---|
| `GET` | `/listings` | Search / browse listings |
| `GET` | `/listings/:id` | Single listing detail |
| `POST` | `/listings` | Create listing |
| `PUT` | `/listings/:id` | Update listing |
| `DELETE` | `/listings/:id` | Delete listing |
| `GET` | `/listings/:id/unavailable-dates` | Blocked dates for calendar |
| `GET` | `/listings/:id/reviews` | Listing reviews |

### Bookings

| Method | Path | Description |
|---|---|---|
| `GET` | `/bookings` | List user bookings |
| `POST` | `/bookings` | Create booking request |
| `GET` | `/bookings/:id` | Booking detail |
| `PATCH` | `/bookings/:id/approve` | Owner approves |
| `PATCH` | `/bookings/:id/decline` | Owner declines |
| `PATCH` | `/bookings/:id/cancel` | Renter cancels |
| `PATCH` | `/bookings/:id/return` | Confirm return |

### Other

| Method | Path | Description |
|---|---|---|
| `GET/POST/DELETE` | `/favorites` | Manage saved listings |
| `GET/POST/DELETE` | `/saved-searches` | Manage saved searches |
| `GET` | `/messages` | Conversations list |
| `GET` | `/messages/:bookingId` | Messages for a booking |
| `POST` | `/messages/:bookingId` | Send a message |
| `GET` | `/users/:id` | Public profile |
| `PUT` | `/users/me` | Update own profile |
| `POST` | `/users/me/avatar` | Upload avatar |
| `POST` | `/verification/submit` | Submit ID verification |

---

## Routes

| Path | Page | Auth required |
|---|---|---|
| `/` | Home | — |
| `/login` | Login | — |
| `/signup` | Sign Up | — |
| `/auth/verify-phone` | OTP Verification | — |
| `/onboarding` | Onboarding | ✓ |
| `/search` | Search Results | — |
| `/listing/:id` | Product Page | — |
| `/checkout` | Checkout | ✓ |
| `/my-bookings` | My Bookings | ✓ |
| `/my-bookings/:id` | Booking Detail | ✓ |
| `/my-bookings/:id/return` | Return Flow | ✓ |
| `/dashboard` | Owner Dashboard | ✓ |
| `/dashboard/bookings` | Owner Bookings | ✓ |
| `/create-listing` | Create Listing | ✓ |
| `/messages` | Messages | ✓ |
| `/profile` | My Profile | ✓ |
| `/users/:userId` | Public Profile | — |
| `/favorites` | Favorites | ✓ |
| `/saved-searches` | Saved Searches | ✓ |
| `/verification` | ID Verification | ✓ |
| `/about` | About | — |
| `/how-it-works` | How It Works | — |
| `/faqs` | FAQ | — |
| `/contact` | Contact | — |
| `/policy` | Terms & Policy | — |

---

## Design System

Design tokens live in `src/index.css` as CSS custom properties:

| Token | Value | Usage |
|---|---|---|
| `--color-brand` | `#5b2e5f` | Primary purple — buttons, links, active states |
| `--color-brand-soft` | `#f3ebf4` | Tinted backgrounds, hover fills |
| `--color-amber` | `#f2a93b` | Accent — CTAs, highlights, selection |
| `--color-cream` | `#fbf7f4` | Page background |
| `--color-ink` | `#241726` | Default text |
| `--color-muted` | `#8a7d8c` | Subdued labels |
| `--color-green` | `#3d8c6c` | Success states |
| `--color-rose` | `#d1495b` | Error / destructive states |
| `--color-line` | `#ece3e6` | Borders and dividers |

---

## License

Private — all rights reserved.
