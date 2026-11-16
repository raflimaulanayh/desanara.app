---
name: Desanara
description: Desanara — a friendly village marketplace where every product carries its village's name, colour and story.
colors:
  brand-green: '#0f5a37'
  leaf: '#5e8f3e'
  sun: '#e3a84f'
  clay: '#c2612c'
  logo-soil: '#cb8b41'
  paper: '#ffffff'
  ink: '#1c1917'
  muted: '#57534e'
  wash: '#f9f4e7'
  wash-strong: '#f1e8d3'
  line: '#e8dfcb'
  line-strong: '#d2c4a8'
  whatsapp-green: '#0f7a3f'
  open-green: '#15803d'
  pause-amber: '#b45309'
typography:
  family: 'Plus Jakarta Sans, system-ui, sans-serif'
  display:
    {
      fontSize: 'clamp(2rem, 6.5vw, 3.5rem)',
      fontWeight: 800,
      lineHeight: 1.08,
      letterSpacing: '-0.025em',
    }
  title: { fontSize: '1.5rem–1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }
  body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 }
  price: { fontWeight: 800, fontVariantNumeric: 'tabular-nums' }
rounded: { default: '0.75rem (--radius, village-adjustable)', pill: '9999px' }
---

# Design System: Desanara

## Overview

**Creative north star: "Pasar desa yang rapi".** The public site should feel like any good marketplace the buyer already
knows (search first, photo grid, price, one obvious button) while the village is always visible: every card names its
village, every village has a page that reads like a destination. Friendly, light, quick on a cheap Android phone.
Replaces the earlier "Buku Nota & Stempel" concept (rejected 2026-11-03: too metaphorical, felt like a form, not a shop).

## Colors

- **Desanara green** `#0f5a37`: platform accent (primary buttons, links, search submit). White on it 8.3:1. Inside a
  village page the accent becomes that village's own colour (ADR 0007).
- **Secondary palette** (tokens `leaf`, `sun`, `clay`): decoration, illustration and highlights only.
  `sun` `#e3a84f` takes dark text (8.3:1); `leaf` `#5e8f3e` (3.8:1) and `clay` `#c2612c` (4.2:1 with white) only for large
  text (≥ 19 px bold) or non-text shapes. `logo-soil` `#cb8b41` is the logo's orange and stays inside the logo.
- **WhatsApp green** `#0f7a3f`: only for ordering/chat actions, in every village, so the action is always recognised.
- **Neutrals**: white surfaces (cards), warm cream `wash` `#f9f4e7` backgrounds for sections and tiles, `line` borders.
  Text is warm near-black.
- **Status**: green = open, amber = temporarily closed, neutral = closed. Verified uses the accent-soft tint.
- Rules: no gradients except the village cover when it has no banner; no pure `#000`; village accents keep 3:1 contrast
  on white (enforced in code) and are used for headings, icons and badges, not for body text.

## Logo

Vector masters in `docs/brand/desanara/` (one path per letter/element, ids for motion); served copies in
`apps/web/public/brand/`. Use the `Logo` / `LogoMark` components; never re-type the wordmark in a font. Rules: `docs/brand/README.md`.

## Typography

Plus Jakarta Sans for everything on platform pages (400–800). Villages may swap the _display_ face through
`font-village` (Barlow Condensed, Bitter, Nunito, Poppins) for their name and section headings only. Prices are bold with
tabular numerals. Body ≥ 16 px, line length ≤ 68ch.

## Layout & shape

Container `max-w-6xl`, 16 px gutters on phones. Product grids: 2 columns on phones, 3 on tablets, 4 on desktop. Cards are
`rounded-(--radius)` with a `line` border and a soft shadow only on hover. Buttons, chips, search and badges are fully
rounded pills. Tap targets ≥ 44 px.

## Components

- **Header**: logo, always-visible search pill, Jelajah/Tentang, ID|EN switch. Sticky. Search stays in the header on phones (second row).
- **Search form**: plain GET form, works without JavaScript.
- **Product card**: square photo (or tinted category tile in the village colour when there is no photo), name (2 lines),
  price, a pin line "Desa · UMKM". Out-of-stock shows a dark pill on the photo.
- **Village card / village page**: cover (photo or gradient in the village colour), round crest with white frame, name in
  the village font, region, counts, "Diverifikasi desa" badge. Official crests are shown untouched.
- **Order panel (product page)**: quantity stepper, note, then one WhatsApp-green button. On phones the total and button
  stick to the bottom; on desktop they sit in the flow. Below it: "Dari desa …" and "Dijual oleh …" cards.
- **Open-status badge**: dot + label (Buka / Tutup / Tutup sementara) with detail text where there is room; never shown
  without a schedule.
- **Verified badge**: accent-soft pill with a check icon.
- **Footer**: platform description, links, required credit with HIMASIF and SATU University logos (mono recolour only).

## Do

- Put the village name on every product surface.
- Keep one primary action per screen; ordering is always WhatsApp green.
- Design the no-photo state as a normal state: most products start without photos.
- Test at 360 px width.

## Don't

- No skeuomorphic or metaphor-heavy styling (paper, stamps, receipts).
- No on-screen "demo" labels (sample data is controlled through `is_seed` and `db:seed:reset`, see PRODUCT.md).
- No custom CSS/HTML from villages; only tokens (ADR 0007).
- Don't redraw partner or village logos.
