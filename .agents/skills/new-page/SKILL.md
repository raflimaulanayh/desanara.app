---
name: new-page
description: Add a page to apps/web (public, bilingual) or apps/dashboard (role-aware) using HeroUI v3, next-intl, and the typed API client.
---

# New page

## apps/web (public)

- Route under `src/app/[locale]/<english-segment>/page.tsx` (ADR 0006). Call `setRequestLocale(locale)`.
- Fetch in the Server Component with `api` from `@/lib/api` + `unwrap()`; handle API failure with an empty state.
- `generateMetadata` with translated title/description; OG image for shareable pages (products, businesses).
- Copy in **both** `messages/id.json` and `messages/en.json` (same keys). Links via `Link` from `@/i18n/navigation`.

## apps/dashboard

- Route under `src/app/<segment>/page.tsx`; data with TanStack Query (`useQuery`/`useMutation`) and `api` from `@/lib/api`.
- Hide actions the user may not perform with `can()` from `@repo/auth/permissions` (UX only — the API enforces).
- Forms: validate with the shared Zod schema from `@repo/validators`; big touch targets, one step per screen,
  plain Indonesian copy (users may not be tech-savvy).

## Both

- HeroUI **v3** only: check the HeroUI MCP server (`heroui-react`) for component APIs. Interactive parts in `'use client'` files.
- Mobile first: 16 px side gutters, test at 360 px width and on a low-end Android.
- Never import `@repo/db` or `@repo/auth/server` (lint enforces it).
- Update `docs/product/features-mvp.md` and `docs/CHANGELOG.md`. For UI polish, use the `impeccable` skill.
