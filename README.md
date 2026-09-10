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
VITE_API_URL=http://localhost:3001
```

### Backend

The API lives in a separate repository: `~/programming/circle-backend` (NestJS 11 + Prisma + PostgreSQL). See its `README.md` for setup — the short version:

```bash
cd ~/programming/circle-backend
docker run -d --name circle-postgres \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=circle_rent \
  -p 5432:5432 postgres:16-alpine
npm install && npx prisma migrate dev && npm run db:seed
npm run start:dev   # http://localhost:3001
```

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

The full contract is documented in `API_CONTRACT.md` and implemented by the `circle-backend` NestJS app. All endpoints require a `Bearer` token in the `Authorization` header (except auth endpoints). The token is stored in `localStorage` under the key `circle_token`.

Key endpoints (see `src/services/*` for the authoritative list):

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/sign-up`, `POST /auth/sign-in` → `{ otpSent }`, `POST /auth/verify-otp`, `GET /auth/me`, `POST /auth/sign-out`, `PUT /auth/onboarding` |
| Listings | `GET /listings` (filters, `?mine=true`), `GET/POST/PUT/DELETE /listings/:id`, `GET/POST /listings/:id/reviews`, `GET /listings/:id/availability` |
| Bookings | `GET /bookings?role=renter\|owner`, `POST /bookings`, `GET /bookings/:id`, `PUT /bookings/:id/status`, `PUT /bookings/:id/return` |
| Favorites | `GET/POST /favorites`, `DELETE /favorites/:id`, `GET /favorites/:id/check` |
| Messages | `GET/POST /conversations`, `GET/POST /conversations/:id/messages`, `PUT /conversations/:id/read` |
| Saved searches | `GET/POST /saved-searches`, `PUT/DELETE /saved-searches/:id` |
| Dashboard | `GET /dashboard/owner/summary`, `GET /dashboard/renter/summary` |
| Users | `GET /users/:id`, `PUT /users/me`, `POST /users/me/verification` |

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
