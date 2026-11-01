# 0006 — English URL segments

- Status: Accepted (2026-11-01)

## Decision

Static path segments are English for every locale: `/id/explore`, `/en/explore`, `/id/villages/baros`.
Dynamic slugs follow the content language (usually Indonesian): `/en/products/keripik-bu-ani-keripik-singkong-original`.

## Consequences

- One route tree for both locales; code and URLs use the same words.
- SEO impact is small: titles, descriptions and slugs carry the Indonesian keywords.
- Localised pathnames (`/id/jelajah`) can be added later with next-intl `pathnames` plus redirects from the English ones.
