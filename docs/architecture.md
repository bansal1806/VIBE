# Architecture Overview

## Frontend
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS, custom design tokens, Framer Motion
- **State/Data**: React Query (`@tanstack/react-query`)
- **Auth**: Clerk components + middleware
- **Realtime**: Supabase Realtime client helpers
- **Responsiveness**: Mobile-first layouts, responsive grid, persistent ad slots

## Backend
- **APIs**: Next.js Route Handlers & Server Actions
- **Database**: PostgreSQL (Supabase managed in prod, locally installed DB for dev) via Prisma ORM
- **Realtime**: Supabase Realtime channels (rooms, chat, presence)
- **Caching/Jobs**: Redis + BullMQ worker (room expiry, timecapsule unlocks)
- **Storage**: Supabase Storage (prod) / local uploads (dev)
- **Authentication**: Clerk (email magic link, .edu enforcement)

## Infrastructure
- **Local**: Native installations (Postgres, Redis). Supabase Realtime via Supabase CLI.
- **Staging**: Vercel Preview + Supabase staging project + Clerk staging.
- **Production**: Vercel + Supabase + Clerk. CI/CD through GitHub Actions.

## Feature Modules
1. **Onboarding**: Campus email verification, alias/profile setup, interest tags.
2. **Discover**: Swipe deck combining people, rooms, events with ad interleaves.
3. **Now Rooms**: Realtime presence, radar visualization, join flow, temporary rooms.
4. **Chat**: Direct + room chat, typing indicators, attachments, read receipts.
5. **Timecapsules**: Scheduled releases, legacy content, unlock notifications.
6. **Profile & Settings**: Privacy controls, dual identity, skill credits.

## Data Models
Defined in `prisma/schema.prisma` covering users, rooms, conversations, messages, timecapsules.

## Roadmap Snapshot
1. Scaffold environment, dependencies, Postgres/Redis setup, Prisma.
2. Integrate Clerk auth & onboarding flow.
3. Wire Supabase Realtime helpers.
4. Build feature modules incrementally.
5. Add ad slots, analytics instrumentation.
6. Automate tests, setup CI/CD, prepare staging & production environments.

