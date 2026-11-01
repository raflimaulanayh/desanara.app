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

- Bilingual public site (`/id`, `/en`); English URL segments, Indonesian content slugs; user content written in Indonesian with optional English.
- Per-village branding: accent colour (contrast-checked), logo, banner, corner style, curated fonts, template choice — no custom CSS/HTML. Applies to village, business and product pages; national pages and the dashboard keep the platform brand. Businesses follow their village's theme.
- Stack: Next.js 16 + HeroUI v3 + Tailwind CSS v4 (web, dashboard), Hono API, PostgreSQL. See `AGENTS.md`.
- Undecided: the platform brand name (placeholder "UMKM Desa"; candidates OlehDesa, AsalDesa, RupaDesa were not accepted yet).

## Brand Commitments

- Credit to **HIMA Sistem Informasi, SATU University** must appear; the HIMA SI and SATU University logos are required on the public site (assets not yet received — do not draw or approximate them).
- Partner village logos appear on their village pages. Desa Baros currently uses the KIM (Kelompok Informasi Masyarakat) Desa Baros logo (`/Users/raflimaulana/Documents/PROJECTS/UNIVERSITY/baros/kim-baros/public/kim-logo.png`) as a stand-in until the official village logo is provided.

## Evidence on Hand

- Desa Baros KIM logo and a tourism photo (`baros/kim-baros/public/view-wisata.jpg`).
- No real product photos, testimonials, sales figures or partner endorsements yet. Demo businesses, products and statistics are fictional and must stay labelled as demo; never present them as real.

## Product Principles

1. The village is the unit of identity: every product is shown with where it comes from and who made it.
2. One tap to the maker: contacting the seller on WhatsApp is always the clearest action.
3. Works for the least-equipped user: cheap phones, slow data, non-technical owners.
4. Honest by default: demo data is labelled, statuses are computed rather than guessed, nothing is fabricated.
5. Trust is visible: verification by the village and mentoring by HIMA are shown, not implied.

## Accessibility & Inclusion

- WCAG 2.1 AA as the baseline; village accent colours must keep 3:1 contrast on white (enforced in code).
- Plain Indonesian for sellers; large touch targets; readable at 360 px width; meaningful without images (many products have no photo yet).
