# Vibe Enhancement Tasks

## Phase 1: Privacy Gradient Implementation
- [x] Create `lib/utils/privacy.ts` for profile masking
- [x] Update `app/api/feed/route.ts` to integrate masking
- [x] Create `app/api/profile/[id]/route.ts` for single profile views

## Phase 2: Automated Trust Progression
- [x] Update `jobs/worker.ts` to award trust on room expiry
- [x] Verify BullMQ worker processes room expiry trust correctly

## Phase 3: Admin & Moderation Dashboard
- [/] Scaffold `app/(app)/admin/page.tsx`
- [ ] Implement `app/api/admin/moderation/route.ts`

## Phase 4: Robust E2E Testing
- [ ] Initialize Playwright configuration
- [ ] Add `tests/e2e/auth.spec.ts`
- [ ] Add `tests/e2e/room-flow.spec.ts`

## Phase 5: Nexus UI Overhaul (Instagram Inspired)
- [/] Update `globals.css` with Instagram design tokens
- [/] Implement `NexusLanding.tsx` with 50/50 split
- [/] Create `HeroPane.tsx` - Fix overlapping & add trust badge
- [/] Create `AuthPane.tsx` - Add app badges & refined spacing
- [/] Implement Meta-style Footer in `NexusLanding.tsx`
- [/] Fix Infrastructure: Switch to local Redis
- [ ] Fix Infrastructure: Replace `[REGION]` in `DATABASE_URL`
- [ ] Final visual polish and responsive testing
