# 0008 — Indonesian URL segments, no prefix for the default locale

- Status: Accepted (2026-11-03) — supersedes [0006](0006-english-url-segments.md) once accepted

## Context

ADR 0006 chose English path segments (`/id/villages/baros`). Most buyers are Indonesian, content slugs are already
Indonesian, and links are mostly shared through WhatsApp, where short readable URLs matter. Mixing English segments
with Indonesian slugs (`/id/villages/baros/keripik-bu-ani`) reads oddly to the main audience.

## Decision

- Public static segments are Indonesian for every locale: `/jelajah`, `/desa/[village]`, `/desa/[village]/[business]`,
  `/produk/[product]`, `/tentang`.
- next-intl `localePrefix: 'as-needed'`: Indonesian (default) has no prefix (`/desa/baros`); English uses `/en`
  (`/en/desa/baros`).
- Old URLs (`/id/...`, `/villages/...`, `/products/...`, `/explore`, `/about`) permanently redirect (308) to the new ones.
- API paths are unchanged (`/v1/villages`, `/v1/products`): they are a code contract, not public URLs.
- Code identifiers stay English (`village`, `business`, `product`); only route folders and URLs change.

## Consequences

- Shorter, more natural links for Indonesian buyers (`sudutdesa.id/desa/baros`).
- English visitors see Indonesian segments (`/en/desa/baros`). Accepted: common on Indonesian sites, and titles,
  descriptions and UI are still translated.
- Route folder names differ from code names (`desa/[desa]` renders a `village`); documented in `docs/architecture/i18n.md`.
- Redirects must be kept for links already shared.

## Alternatives

- **Keep English segments (0006):** consistent with code, but less natural for the main audience.
- **Localised pathnames** (`/desa` for ID, `/en/villages` for EN) with next-intl `pathnames`: best for English SEO, but
  doubles route names to maintain and complicates typed links. Can be added later on top of this decision.
