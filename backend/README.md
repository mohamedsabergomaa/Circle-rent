# Circle Backend

P2P rental marketplace API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Configuration:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Run Development Server:
   ```bash
   npm run dev
   ```

## Database Setup

We use a hosted Postgres instance (Supabase free tier) rather than local Docker.

1. Create a free project at [supabase.com](https://supabase.com/).
2. Go to **Project Settings > Database**.
3. Copy the "Connection string" (URI format) — make sure to use the "Transaction" pooler mode for serverless-friendly connections.
4. Paste the connection string into your local `.env` file as `DATABASE_URL`.

**Note:** Supabase requires both a pooled URL (`DATABASE_URL`, for the app's normal runtime queries) and a direct URL (`DIRECT_URL`, used only when running Prisma migrations). Both can be copied from the same "Connect" panel in the Supabase dashboard under the ORM/Prisma tab. Each developer should ideally create their own Supabase project for local dev. If the team shares a single project's credentials, everyone will be working against the same live data! This is fine for early development, but keep it in mind.

### Prisma Commands
After pulling any schema changes:
```bash
npx prisma generate
```

To apply migrations locally:
```bash
npx prisma migrate dev
```

*Note: This is the initial scaffold. Modules will be filled in incrementally per the project roadmap.*
