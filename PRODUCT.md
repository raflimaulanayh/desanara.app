# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Buyers (primary for the public site): people looking for village specialities, with oleh-oleh (souvenir/gift) seekers as the priority** — tourists and city residents choosing products from a specific village, often on a phone. Local residents and resellers/B2B/government buyers are also served, but the main experience is built for the oleh-oleh seeker.
- **UMKM owners** in villages (rural micro/small businesses, many not tech-savvy) who want their products found.
- **Assistants (pendamping)** — HIMA students/KKN who enter and maintain business data on the owner's behalf.
- **Village admins / BUMDes** who verify businesses once and follow the impact.
- **Super admins (HIMA)** who run the platform.

## Product Purpose

A multi-village catalogue where each village (desa) is a tenant with its own page and branding. Buyers discover products in the context of their village and contact the maker directly through WhatsApp. It is paired with a UMKM education programme (product photos, descriptions and pricing, WhatsApp Business, using the platform, licensing). Success for the MVP: live at the pilot village seminar on 2026-12-11, villages and businesses visible in Indonesian and English, and measurable views and WhatsApp clicks per business.

## Positioning

Unlike Shopee/Tokopedia, every product is shown as part of a village and its story, buyers talk directly to the maker with no middleman or commission, businesses are verified by their village admin and mentored by HIMA Sistem Informasi SATU University, and buying here directly supports the village economy.

## Operating Context

- Buyers browse on mobile phones, often mid-range or low-end Android on mobile data; links are shared through WhatsApp.
- Ordering, payment and delivery happen in WhatsApp (or the seller's own marketplace links) — the site never takes payment in the MVP.
- Business data is often entered by an assistant, then handed over to the owner through an invitation link.
- Businesses show an open/closed status computed from a weekly opening-hours schedule, with a "temporarily closed until …" override, so the status stays right even when owners forget to update it; businesses without a schedule show no status.
- Pilot village: **Desa Baros, Kecamatan Arjasari, Kabupaten Bandung (Jawa Barat)**. Until real data is collected, its businesses and products are demo data.

## Capabilities and Constraints

- Bilingual public site (Indonesian at `/`, English at `/en`); Indonesian URL segments (`/desa/baros`, `/produk/...`, `/jelajah`, `/tentang`) and content slugs; user content written in Indonesian with optional English.
- Per-village branding: accent colour (contrast-checked), logo, banner, corner style, curated fonts, template choice — no custom CSS/HTML. Applies to village, business and product pages; national pages and the dashboard keep the platform brand. Businesses follow their village's theme.
- Stack: Next.js 16 + HeroUI v3 + Tailwind CSS v4 (web, dashboard), Hono API, PostgreSQL. See `AGENTS.md`.
- Brand name: **Desanara** — tagline _"Ragam Karya, Cerita Nusantara."_ (chosen 2026-11-15, replaces Sudut Desa; planned domain `desanara.id`). Constant `BRAND_NAME` in `@repo/i18n`. Brand guide: `docs/brand/README.md`.

## Brand Commitments

- Credit to **HIMA Sistem Informasi, SATU University** must appear with their logos. The official HIMASIF and SATU University logos (white mono versions) are in `apps/web/public/brand/` and are printed in a neutral ink through a CSS mask (mono recolour, never redrawn). Source: `baros/kim-baros/public/static/images/copyright/`.
- Partner village logos appear on their village pages. Desa Baros uses the crest of its official Pemerintah Desa Baros logo (`desa-baros.png`, same source folder), shown in a round frame on its village page and cards.

## Evidence on Hand

- Official logos: Pemerintah Desa Baros, HIMASIF, SATU University, Sistem Informasi SATU University (`baros/kim-baros/public/static/images/copyright/`); Desa Baros tourism photo (`baros/kim-baros/public/view-wisata.jpg`).
- No real product photos, testimonials, sales figures or partner endorsements yet. Sample businesses, products and statistics are fictional: keep `is_seed = true`, keep their WhatsApp on the team number, and replace them with real data before launch.

## Product Principles

1. The village is the unit of identity: every product is shown with where it comes from and who made it.
2. One tap to the maker: contacting the seller on WhatsApp is always the clearest action.
3. Works for the least-equipped user: cheap phones, slow data, non-technical owners.
4. Honest by default: statuses are computed rather than guessed, nothing is invented in the UI. Sample data is not labelled on screen (decision 2026-11-03) but is flagged `is_seed` in the database, its WhatsApp number is the team's, and it must be removed with `db:seed:reset` before the site is public.
5. Trust is visible: verification by the village and mentoring by HIMA are shown, not implied.

## Accessibility & Inclusion

- WCAG 2.1 AA as the baseline; village accent colours must keep 3:1 contrast on white (enforced in code).
- Plain Indonesian for sellers; large touch targets; readable at 360 px width; meaningful without images (many products have no photo yet).
