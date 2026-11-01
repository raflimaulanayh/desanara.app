# 0007 — Per-village theming with curated tokens and code templates

- Status: Accepted (2026-11-01)

## Context

Each village wants its own look (colour, logo, banner, font, layout) while we provide a good default.
Admins are not designers, pages must stay fast and readable on cheap phones, and the platform must stay secure.

## Decision

- Customisation = **brand kit** (logo, banner, accent colour, corner style), **template choice** and **font choice**
  from curated lists. **No custom CSS/HTML and no page builder.**
- Templates are React code in `apps/web/src/templates/<id>`, reviewed like any code. The database stores only the
  choice and tokens: `villages.theme` (published) and `villages.theme_draft` (editing), JSONB shaped by
  `villageThemeSchema` (`@repo/validators`, versioned).
- Applied to village-scoped pages only (village, its businesses, its products). National pages and the dashboard
  keep the platform brand. Businesses follow their village theme.
- Rendering: the server sets CSS variables on a wrapper (`villageThemeAttributes()` in `@repo/ui/village-theme`).
  `[data-village-theme]` in `packages/ui/src/theme.css` re-declares HeroUI's derived variables
  (`--accent-hover`, `--accent-soft*`, `--focus`, `--field-radius`), which HeroUI computes once on `:root`.
- Accessibility: accent must reach 3:1 contrast against white; the text colour on the accent is computed
  (`readableForeground`).
- Reading is forgiving: `parseVillageTheme()` repairs invalid fields with defaults so a bad row never breaks a page.
- Permission: `village.customize_theme` (village admin, super admin).

## Consequences

- MVP ships the brand kit + one template (`classic`); new templates/fonts = add to the enum + component, no migration.
- Fonts are loaded with `next/font` at build time; adding a font is a code change. The village face applies to
  village/business/product names only, so the platform's nota structure stays consistent (revised 2026-11-01:
  list is barlow-condensed, bitter, nunito, poppins).
- Upgrading HeroUI requires re-checking the derived variables list (comment in `theme.css`).
- Subdomains / custom domains per village (phase 2) reuse the same theme.

## Alternatives

- Free CSS/HTML — rejected (XSS risk, broken layouts, support burden).
- Theme per business — rejected for now (inconsistent village pages, more UI work).
- Separate `village_themes` table — unnecessary: one theme per village, JSONB + Zod is enough.
