---
name: UMKM Desa
description: Village specialities as a shop's carbon-copy order book, certified by rubber stamps.
colors:
  stamp-violet: '#5b21b6'
  nota-ink: '#1f3a8a'
  paper: '#ffffff'
  ink-black: '#141a2b'
  muted-ink: '#4f5874'
  nota-rule: '#c7d3ec'
  nota-rule-strong: '#8fa5d6'
  carbon-pink: '#fbe3ea'
  carbon-yellow: '#fbf1c7'
  carbon-blue: '#eaf0fb'
  stamp-red: '#b42318'
  open-green: '#1f7a3d'
typography:
  display:
    fontFamily: 'Barlow Condensed, Barlow, sans-serif'
    fontSize: 'clamp(2.6rem, 9vw, 5.25rem)'
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: '-0.015em'
  headline:
    fontFamily: 'Barlow Condensed, Barlow, sans-serif'
    fontSize: 'clamp(1.6rem, 5vw, 2.25rem)'
    fontWeight: 700
    lineHeight: 0.95
  title:
    fontFamily: 'Barlow Condensed, Barlow, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: 'Barlow, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Barlow Condensed, Barlow, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 600
    letterSpacing: '0.16em'
  price:
    fontFamily: 'Barlow Condensed, Barlow, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 600
    fontFeature: 'tnum'
rounded:
  sharp: '0.25rem'
  rounded: '0.75rem'
  pill: '1.25rem'
spacing:
  row-y: '12px'
  gutter: '16px'
  gutter-sm: '24px'
  section: '56px'
components:
  button-primary:
    backgroundColor: '{colors.stamp-violet}'
    textColor: '{colors.paper}'
    rounded: '{rounded.sharp}'
    height: '56px'
    padding: '0 24px'
  button-outline:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.nota-ink}'
    height: '48px'
    padding: '0 20px'
  input-ruled:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink-black}'
    height: '56px'
  order-slip:
    backgroundColor: '{colors.carbon-pink}'
    textColor: '{colors.ink-black}'
    padding: '20px'
  demo-notice:
    backgroundColor: '{colors.carbon-yellow}'
    textColor: '{colors.ink-black}'
    padding: '12px 16px'
---

# Design System: UMKM Desa

## Overview

**Creative North Star: "Buku Nota & Stempel"**

The public site is a shop's carbon-copy order book. Products are lines on a nota (white paper, blue ruling, navy printed column heads, tabular prices). Every fact the platform states is pressed on as a rubber stamp: open, closed, temporarily closed, verified by the village, demo data. Every village is a round _cap desa_ seal in its own ink. Ordering means writing a nota and sending it to the maker on WhatsApp; the slip is stamped TERKIRIM when it goes.

The surface is light because buyers browse on phones in daylight and the material is paper. Density is a ledger's: tight rows, generous space between sections, no photo-card grid. Expression comes from print, meaning condensed caps, double rules, stamp ink, and carbon-copy tints, never from gradients, glass, or shadows. The platform's stamp ink is violet. Inside a village (its page, businesses, and products), the accent becomes that village's ink and its chosen display face.

**Key Characteristics:**

- White order-book paper, blue rules, navy printed heads in Barlow Condensed caps.
- Accent is stamp ink: platform violet, each village its own contrast-checked ink.
- States and claims are stamps, never chips or badges.
- Prices and quantities are tabular and right-aligned like a nota.
- Carbon-copy tints (pink, yellow, blue) mark slips, notices, and sections.

## Colors

One ink per context on white paper, with three carbon-copy tints for secondary sheets.

### Primary

- **Stamp Violet** (`{colors.stamp-violet}`): the platform's stamp ink on national pages. Used for the wordmark, primary actions, links, and stamps. On village pages it is replaced by the village ink (`--accent`, set per village and contrast-checked ≥ 3:1 on white). Demo villages: Baros teal `#0e7490`, Mekarwangi brick `#b23a1e`, Sindangjaya green `#2e7d32`.

### Secondary

- **Nota Navy** (`{colors.nota-ink}`): the printed ink of the book itself. Used for column heads, section titles on sheets, double rules, header and footer rules, and form underlines. It is never used as a village accent, so village inks stay distinguishable from the book.

### Neutral

- **Paper** (`{colors.paper}`): page ground and sheet surface.
- **Ink Black** (`{colors.ink-black}`): body text and display headlines.
- **Muted Ink** (`{colors.muted-ink}`): meta lines (business · village, units, hints).
- **Nota Rule** (`{colors.nota-rule}`) / **Strong Rule** (`{colors.nota-rule-strong}`): row dividers, ruled-paper lines, sheet borders.
- **Carbon Pink** (`{colors.carbon-pink}`): the order slip ("Lembar penjual").
- **Carbon Yellow** (`{colors.carbon-yellow}`): demo notices and the no-photo label strip.
- **Carbon Blue** (`{colors.carbon-blue}`): row hover and the "Cara pesan" band.
- **Stamp Red** (`{colors.stamp-red}`): DATA DEMO and TUTUP SEMENTARA stamps only.
- **Open Green** (`{colors.open-green}`): the BUKA stamp only.

### Named Rules

**The One Ink Rule.** A page has one accent ink: violet on national pages, the village's own ink inside a village. Red and green are reserved for status stamps.

**The Book Is Navy Rule.** Structure (rules, column heads, sheet titles) is printed in navy, whatever the village ink. Village ink marks identity and action, never the ruling.

## Typography

**Display Font:** Barlow Condensed (with Barlow, sans-serif)
**Body Font:** Barlow (with ui-sans-serif, system-ui)
**Village display faces:** Barlow Condensed (default), Bitter, Nunito, Poppins. These apply to village and business names and product titles only (`font-village`).

**Character:** A small-town print shop's condensed caps over a plain, legible reading face, like a nota's printed header above handwriting-sized entries.

### Hierarchy

- **Display** (700, clamp(2.6rem, 9vw, 5.25rem), 0.92, uppercase, −0.015em): landing and page headlines; village names use the village face at clamp(2.4rem, 8vw, 4.75rem).
- **Headline** (700, clamp(1.6rem, 5vw, 2.25rem), 0.95, uppercase): business names in the kop and section titles.
- **Title** (700, 1.5–1.875rem, uppercase): nota sheet titles in navy.
- **Body** (400, 1rem–1.125rem, 1.6): descriptions, kept to 52–68ch.
- **Label** (600, 0.75rem, 0.16em tracking, uppercase): column heads, field labels, stamps.
- **Price** (600, 1.125rem; 2.25rem on product pages, tabular figures): every money value.

### Named Rules

**The Printed Caps Rule.** Anything the book prints (heads, labels, stamps, buttons) is Barlow Condensed caps with positive tracking. Anything a person writes or reads at length is Barlow sentence case.

**The Tabular Money Rule.** Prices are always tabular and right-aligned in the price column, formatted as IDR with `formatRupiah`.

## Layout

The container is max 72rem with 16px gutters on phones and 24px from `sm`. Sections breathe at 56–64px vertical padding. Rows are dense (12px vertical) and separated by 1px rules. Nota sheets use a three-column grid (name / unit / price: `1fr 9rem 8rem`). On phones the unit drops under the name, leaving two columns (name / price). Detail pages are two columns from `lg` (`1fr 1.1fr`); on phones the reading order is: label strip, name and price, order slip, description, more items. The primary action must appear within the first screen or two on a 390px phone. Filters on phones are a two-column grid. Every page must work at 360px with no horizontal scroll.

## Elevation & Depth

The system is flat paper. Depth comes from rules, double rules, and carbon tints, not shadows. Two shadows exist: the torn-off order slip lifts slightly off the page (`0 10px 24px -14px rgb(20 26 43 / 0.35)`), and the village seal sitting on the banner photo gets a soft drop (`0 8px 24px -12px rgb(20 26 43 / 0.5)`).

### Named Rules

**The Paper Is Flat Rule.** Sheets, rows, and stamps never cast shadows. Only an object physically lifted off the page (the slip, the seal on a photo) may.

## Shapes

Shapes are square-cornered paper. Sheets and inputs have sharp corners. Rules are 1px; the closing rule of a kop or sheet header is a 3–5px double rule. Stamps are rectangles with a 2px border plus a 1px outline offset 2px (a double frame), rotated −6° to +9°, and multiplied onto the page. Village seals are circles: a 5px outer ring, a 1.5px inner ring, the village name running around the ring, and the logo re-inked by luminance into the village ink in the centre (dark prints dense, white prints nothing). The village `radius` token (sharp 0.25rem, rounded 0.75rem, pill 1.25rem) affects HeroUI controls inside a village, not sheets.

## Components

### Buttons

- **Shape:** square paper edge (`{rounded.sharp}` or none).
- **Primary:** accent-ink fill, white Barlow Condensed caps with 0.08em tracking, 48–56px tall. Used for the search submit, "Kirim nota lewat WhatsApp", and "Chat penjual".
- **Hover / Focus:** fill shifts to `--accent-hover`; a 2px accent focus ring offset by 2px.
- **Outline:** a 2px navy border with navy caps ("Terapkan"); hover fills with carbon blue.
- **Unavailable:** a dashed-border non-link span with muted caps. It is never a disabled link.

### Inputs / Fields

- **Style:** the ruled line. A transparent field with a 2px navy bottom rule only, like writing on a nota line. Selects use the same rule with a navy chevron.
- **Focus:** the rule turns accent ink.

### Navigation

- **Header:** a cover strip with a 3px navy double rule below. The violet wordmark sits left; condensed-caps links and the ID / EN switch sit right; the active locale is underlined. It is sticky with a near-opaque paper background.
- **Breadcrumbs:** a muted, underlined trail, with the village seal as the first crumb on business pages.

### Nota Sheet (signature)

A white sheet with a strong-rule border. The navy condensed title is closed by a 3px double rule, and the column heads are spaced caps. Rows are links that turn carbon blue on hover. Cross-village lists show a dot in the village ink before the name. An optional printed foot carries stamps.

### Rubber Stamp (signature)

Every state is a stamp: Buka (green), Tutup (muted), Tutup sementara and Data demo (red), Diverifikasi desa and Desa mitra (accent). It is uppercase condensed, double-framed, rotated, and multiplied, with a detail line in muted body text beside it. Statuses are computed from opening hours on the server and refreshed every minute in the browser.

### Cap Desa Seal (signature)

A round SVG seal in the village ink. The village name and region run around the ring, with the re-inked logo or initials in the centre. It is the village's identity on the landing page, the village page, the breadcrumb, and the label strip.

### Kop (letterhead)

A business or village name in the village display face and ink, uppercase, with meta lines and stamps beside it, closed by a 5px double rule in the accent ink.

### Order Slip (signature)

The carbon-pink "Nota pesanan · Lembar penjual" has a dotted perforation edge, ruled paper, and a date line. Below come the quantity stepper (44px targets), name and note fields on ruled lines, and a dashed rule before the total. The send action opens WhatsApp with an Indonesian nota and presses a TERKIRIM stamp (420ms `cubic-bezier(0.16, 1, 0.3, 1)` scale-in; none under reduced motion). This press is the system's one authored motion.

### Notices

A carbon-yellow band with a red DATA DEMO stamp and one plain sentence. It appears wherever demo data is shown.

## Do's and Don'ts

### Do:

- **Do** list products as nota rows (name · unit · tabular price), never as photo cards.
- **Do** state every fact as a stamp, with its evidence beside it (date, closing time, "sampai 4 November").
- **Do** wrap village, business, and product pages in the village theme (`villageThemeAttributes`), and keep national pages violet.
- **Do** label demo data with the DATA DEMO stamp everywhere it appears.
- **Do** keep forms working without JavaScript (plain GET search and filters).

### Don't:

- **Don't** use chips, pill badges, gradient text, glass, or shadowed cards; the paper is flat.
- **Don't** use navy as a village accent, and don't let village ink print the book's ruling.
- **Don't** put a kicker or eyebrow label above a heading; carry category as a nota field ("Jenis: …").
- **Don't** fake ink texture with noise filters; stamps stay crisp vector until a real scanned ink asset exists.
- **Don't** redraw or approximate partner logos; print the supplied mono artwork in nota navy through a mask (`BrandMark`), and keep full-colour logos untouched.
