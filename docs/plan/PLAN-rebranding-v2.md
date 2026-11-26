# DESANARA

## Brand Identity & Inclusive UI/UX Guidelines

**Document Type:** Brand Identity & Product Experience Specification  
**Project:** Desanara  
**Version:** 1.3 (2026-11-21)  
**Status:** Approved Brand Direction  
**Design Strategy:** Mobile-First, Inclusive, Familiar, Cross-Generational  
**Supersedes:** version 1.2 (old orange "d" logo, `#0F5A37` palette, Plus Jakarta Sans)  
**Related:** [`docs/brand/README.md`](../brand/README.md) (logo files and usage rules), [`DESIGN.md`](../../DESIGN.md)
(UI tokens and components), [PLAN-rebranding.md](PLAN-rebranding.md) (phase 1), [PLAN-public-redesign.md](PLAN-public-redesign.md)

> Version 1.3 keeps the brand foundation, audience segmentation and UX philosophy of 1.2, and updates the parts
> that changed with the new leaf logo (2026-11-20): logo description, colours (taken from the designer's SVG
> files), and typography (Montserrat everywhere).

---

# 1. Brand Overview

**Desanara** is a digital platform for discovering, showcasing, and promoting products created by village-based Micro, Small, and Medium Enterprises (MSMEs/UMKM) across Indonesia.

The platform connects three essential elements:

- **Products:** Local goods created by village-based MSMEs.
- **Origins:** The villages and communities where products originate.
- **People:** The producers and businesses behind those products.

Unlike conventional e-commerce marketplaces, Desanara emphasizes product origins, village identities, and local creators.

The initial pilot focuses on **Desa Baros, Kabupaten Bandung, West Java**, with the long-term goal of supporting multiple villages throughout Indonesia.

Desanara currently operates primarily as a product discovery and catalog platform. Customers can browse products and contact sellers directly through WhatsApp.

Shopping carts, internal checkout, and payment processing are not part of the current confirmed product scope.

---

# 2. Brand Foundation

## 2.1 Brand Name

**Desanara**

- Formal name: `Desanara`
- Logo wordmark: `DESANARA` (uppercase, part of the logo artwork)
- Brand inspiration: **Desa Nusantara**

The name represents the diversity of Indonesian villages, their communities, and the products they create.

"Desa Nusantara" is the intended branding interpretation rather than a literal linguistic expansion of every syllable.

## 2.2 Official Tagline

**Ragam Karya, Cerita Nusantara.**

Use this exact tagline in primary brand communications.

Do not automatically translate, rewrite, or replace it.

## 2.3 Brand Purpose

To connect Indonesian village products with wider audiences while celebrating their origins, creators, and local identities.

## 2.4 Brand Vision

To become an accessible digital destination for discovering local products and stories from villages across Indonesia.

## 2.5 Brand Values

1. **Authenticity:** Respect local craftsmanship, identity, and product origins.
2. **Inclusivity:** Support users across generations and levels of digital literacy.
3. **Community:** Strengthen connections between villages, producers, and consumers.
4. **Simplicity:** Make essential actions understandable and straightforward.
5. **Trust:** Communicate product and seller information transparently.
6. **Growth:** Support greater visibility and opportunities for village MSMEs.
7. **Diversity:** Celebrate Indonesian products, cultures, and communities.

## 2.6 Brand Personality

Desanara should feel:

- Warm and approachable.
- Modern without being intimidating.
- Friendly but professional.
- Authentic and locally rooted.
- Trustworthy and transparent.
- Youthful without alienating older generations.
- Simple without appearing outdated.

**Brand Essence:**

_Modern Indonesian warmth, designed for everyone._

---

# 3. Target Audience & Application Segmentation

Desanara serves two primary audiences.

Both applications must share a consistent brand identity but may use different navigation structures, layouts, and interaction patterns based on their respective tasks.

Age and generation are useful audience descriptors, but they must not be treated as reliable substitutes for actual digital literacy, accessibility needs, or user preferences.

## 3.1 Segment A: Sellers, MSMEs & Village Administrators

**Primary Audience:**

- Millennials.
- Generation X.
- Baby Boomers.

**Application Scope:**

- Seller and MSME management.
- Village administration.
- Product management.
- Product information and availability.
- Business profiles.
- Village profiles.
- Operational workflows.

### UX Objectives

The seller and management application must prioritize:

- Task completion.
- Clarity.
- Predictability.
- Readability.
- Error prevention.
- Easy recovery from mistakes.
- Minimal unnecessary cognitive effort.

### Design Principles

1. Use explicit text labels alongside important icons.
2. Make primary actions easy to identify.
3. Avoid unfamiliar gestures for essential functionality.
4. Keep navigation consistent across screens.
5. Group related form fields logically.
6. Provide clear instructions when required.
7. Display understandable success and error messages.
8. Preserve user input when errors occur.
9. Require confirmation for destructive operations.
10. Use progressive disclosure for advanced functionality.
11. Avoid overly dense dashboard layouts on mobile devices.
12. Make operational tasks possible without requiring extensive technical knowledge.

### Recommended Interaction Style

**Task-oriented, clear, familiar, and reassuring.**

Examples:

- "Tambah Produk"
- "Kelola Produk"
- "Simpan Perubahan"
- "Ubah Informasi Desa"
- "Foto Produk"
- "Produk Berhasil Disimpan"

Avoid unnecessary technical terminology or ambiguous icon-only controls.

---

## 3.2 Segment B: Public Visitors & Customers

**Primary Audience:**

- Generation Z.
- Millennials.
- Generation X.
- Baby Boomers.

**Application Scope:**

- Product discovery (no buyer account is needed).
- Business registration through `/gabung` (planned in PLAN-registration-email).
- Product catalogs.
- Product search and filtering.
- Village exploration.
- Brief village profiles.
- Seller information.
- Product details.
- Direct seller contact.

### UX Objectives

The public application must balance:

- Modern visual appeal.
- Familiar e-commerce patterns.
- Easy product discovery.
- Accessible content.
- Trustworthy seller information.
- Clear conversion actions.

### Design Principles

1. Prioritize high-quality product imagery.
2. Use recognizable catalog and product-card patterns.
3. Provide straightforward search and category navigation.
4. Make village origins visible.
5. Use clear product pricing when available.
6. Make seller information easy to find.
7. Keep primary calls to action obvious.
8. Avoid excessive visual clutter.
9. Maintain comfortable reading sizes.
10. Keep the experience engaging without relying on complex interactions.

### Recommended Interaction Style

**Discovery-oriented, visually engaging, familiar, and effortless.**

The experience should be attractive to younger audiences while remaining easy to understand for older visitors.

---

# 4. Cross-Generational UX Philosophy

## Familiarity First, Modernity with Purpose

One of Desanara's most important challenges is designing for users with different generations, smartphone habits, and levels of digital familiarity.

The goal is not to produce an old-fashioned interface for older users or an experimental interface for younger users.

Instead, the goal is to create a modern interface that feels intuitive across generations.

### Core Principles

**1. Familiarity over novelty**

Prefer recognizable interaction patterns unless a new pattern provides a clear usability improvement.

**2. Clarity over minimalism**

Do not remove useful labels, explanations, or navigation cues solely to achieve a minimalist appearance.

**3. Recognition over memorization**

Users should recognize available actions without remembering hidden functionality.

**4. Consistency over decoration**

Similar actions should behave consistently across the application.

**5. Accessibility by default**

Accessibility must be considered throughout the design process.

**6. Progressive disclosure**

Show essential information first and reveal advanced functionality when necessary.

**7. Modern design without age stereotypes**

Avoid treating age as a direct measure of technical capability.

**8. Task success over visual novelty**

An interface is successful when users can complete intended tasks confidently.

---

# 5. Familiar Application UX References

Desanara should learn from interaction patterns already familiar to Indonesian smartphone users.

These are behavioral and usability references, not instructions to copy third-party branding or proprietary designs.

## WhatsApp

Use as inspiration for:

- Simple and direct actions.
- Clear contact flows.
- Readable messaging-related information.
- Familiar confirmation and feedback.
- Straightforward navigation.

Especially relevant for seller contact and simple operational tasks.

## Facebook

Use as inspiration for:

- Familiar card-based content.
- Clear content separation.
- Straightforward profile structures.
- Recognizable navigation.
- Simple content management interactions.

Especially relevant for users accustomed to social media-based selling.

## Instagram

Use as inspiration for:

- Image-first content.
- Product photography.
- Seller profiles.
- Visual storytelling.
- Simple exploration patterns.

Especially relevant for the public-facing product catalog.

## TikTok

Use as inspiration for:

- Immediate content comprehension.
- Visible interaction controls.
- Engaging visual storytelling.
- Focused content presentation.

Do not automatically introduce video feeds, infinite scrolling, or swipe-only navigation.

Only use these patterns when they meaningfully support the product.

## Shopee & Tokopedia

Use as inspiration for:

- Product catalogs.
- Search and filtering.
- Categories.
- Product cards.
- Price presentation.
- Product details.
- Familiar e-commerce navigation.

Desanara must maintain its own visual identity and product differentiation.

Do not introduce checkout, cart, or payment functionality without separate product requirements.

---

# 6. Mobile-First Product Strategy

Mobile-first development is a core design requirement.

The initial product experience should prioritize smartphone usage, especially affordable Android devices.

### Priorities

- Small and medium mobile screens.
- Touch-friendly controls.
- Efficient navigation.
- Clear primary actions.
- Readable typography.
- Fast content delivery.
- Optimized product imagery.
- Low-bandwidth considerations.
- Predictable interaction feedback.
- Comfortable one-handed interaction where appropriate.

### Requirements

1. Design important mobile flows before desktop layouts.
2. Avoid relying on hover interactions.
3. Prevent unnecessary horizontal scrolling.
4. Use appropriate mobile input controls.
5. Maintain consistent navigation patterns.
6. Keep essential actions visible and understandable.
7. Avoid excessive animation.
8. Ensure forms work comfortably on smartphones.
9. Preserve important information at smaller screen widths.
10. Maintain accessibility when users resize text.

Desktop and tablet experiences should remain responsive and well structured, but must not dictate the initial mobile interaction model.

---

# 7. Approved Visual Identity

The new Desanara logo (designed by the HIMASIF team from a hand sketch, adopted 2026-11-20) and the files in
`docs/brand/desanara/` are the authoritative visual references.

The development agent must preserve them without redesigning or replacing their essential visual elements.

## 7.1 Logo Identity

The approved logo consists of:

- A leaf mark: a lowercase "d" formed by one tall leaf and one small sprout leaf.
- A vertical gradient from light green `#9DD950` (top) to Hijau Desanara `#387B4C` (bottom), with subtle dark
  shading inside the leaves.
- The wordmark `DESANARA` in Montserrat Bold, colour Daun `#6CAC4E`, converted to outlines.
- The tagline "Ragam Karya, Cerita Nusantara" in Montserrat SemiBold with wide letter spacing.

### Symbolism

| Element                   | Meaning                                                  |
| ------------------------- | -------------------------------------------------------- |
| "d" made of two leaves    | The village as the root: work that grows from its nature |
| Tall leaf                 | MSME growth towards wider markets                        |
| Small sprout              | New businesses and the young generation of the village   |
| Light-to-dark green blend | From a fresh sprout to a mature, finished product        |

### Logo Files

| Asset             | File                         | Use for                                         |
| ----------------- | ---------------------------- | ----------------------------------------------- |
| Horizontal logo   | `logo-horizontal.svg`        | Site and dashboard header, documents, slides    |
| Logo with tagline | `logo-tagline.svg`           | Covers, banners, share images                   |
| Vertical logo     | `logo-vertical.svg`          | Posters, packaging, splash screens              |
| Leaf mark         | `mark.svg`                   | Social avatars, watermarks, tight spaces        |
| App icon          | `app-icon.svg`               | Favicon, phone icon (white mark on gradient)    |
| White / black     | `*-white.svg`, `*-black.svg` | Green or dark photo backgrounds; 1-colour print |

### Logo Rules

- Use the approved SVG files as the source of truth (`docs/brand/desanara/`, generated by `docs/brand/build-logo.py`).
- In code, use the `Logo` / `LogoMark` components. Do not reconstruct the logo with live text, even in Montserrat.
- Do not recolour, stretch, rotate, outline, or add effects to the logo.
- Do not create alternative brand marks without explicit approval.
- Minimum size: horizontal logo 32 px high (below that, use the leaf mark alone); leaf mark 16 px.
- Clear space around the logo: at least the height of the "E" in the wordmark.
- Spelling is always "Desanara" (the designer's file names say "Desantara"; that is a typo).

---

# 8. Brand Color System

All values are taken from the designer's SVG files. The label `#109C4F` on the designer's brand sheet does not match
its own swatch or the logo gradient (both `#387B4C`) and is not used.

## Brand Palette

| Role              | Name           | HEX       | Use                                                     |
| ----------------- | -------------- | --------- | ------------------------------------------------------- |
| Brand Primary     | Hijau Desanara | `#387B4C` | Primary buttons, links, headings; dark end of the logo  |
| Brand Secondary   | Daun           | `#6CAC4E` | Logo wordmark, nature accents, large text only          |
| Brand Highlight   | Tunas          | `#9DD950` | Highlights and badges with dark text; light end of logo |
| Brand Accent      | Mentari        | `#E3A84F` | Small accents: promo badges, draft notes (dark text)    |
| Brand Warm Accent | Bata           | `#C2612C` | Sparing emphasis                                        |
| Brand Background  | Krem           | `#F9F4E7` | Section backgrounds, warm neutral                       |
| Text              | Tinta          | `#1C1917` | Body text and headings on light backgrounds             |
| Ordering action   | WhatsApp green | `#0F7A3F` | Only for "Pesan via WhatsApp" and chat actions          |

Token names in code (`packages/ui/src/theme.css`): `accent`, `leaf`, `sprout`, `sun`, `clay`, `wash`, `foreground`,
`wa`.

### Color Principles

- Hijau Desanara is the primary brand and action colour.
- Daun supports natural visual elements; it is too light for small text on white (2.8:1).
- Tunas and Mentari always carry dark text, never white text.
- The logo gradient is used only in the logo and the app icon, not as a UI background.
- WhatsApp green stays the same in every village so the ordering action is always recognised.

### Contrast (checked)

| Pair                         | Ratio  | Result                |
| ---------------------------- | ------ | --------------------- |
| White text on `#387B4C`      | 5.1:1  | Passes AA             |
| `#387B4C` text on Krem       | 4.7:1  | Passes AA             |
| Tinta on Tunas `#9DD950`     | 10.4:1 | Passes AAA            |
| Tinta on Mentari `#E3A84F`   | 8.3:1  | Passes AAA            |
| White text on Daun `#6CAC4E` | 2.8:1  | Large decorative only |

### UI Color Considerations

Brand colors should not replace proper semantic colors.

Use additional accessible tokens for:

- Primary and secondary text.
- Muted text.
- Surface backgrounds.
- Borders.
- Disabled states.
- Focus states.
- Success, warning, and error feedback (open `#15803D`, paused `#B45309`; see `DESIGN.md`).

Maintain sufficient contrast and visual hierarchy.

Avoid using color alone to communicate important information.

---

# 9. Typography System

## 9.1 Typography Decision

**Montserrat is used everywhere**: the public site, the dashboard, the API docs login page, documents, and slides.

The logo wordmark is Montserrat Bold (outlined), so using the same family in the interface makes the product and the
logo feel like one brand.

Reference: [https://fonts.google.com/specimen/Montserrat](https://fonts.google.com/specimen/Montserrat)

In code, Montserrat is loaded with `next/font` as a variable font (one file for every weight) and exposed as
`--font-montserrat`. Villages may still choose a separate display face for their own name and section headings
on village pages (ADR 0007); everything else stays Montserrat.

## 9.2 Montserrat in Practice

Montserrat has wide, geometric letterforms. To keep it readable on small phones:

- Use 400–500 for body text and 600–700 for labels and buttons. Avoid weights below 400.
- Keep product names to two lines (`line-clamp-2`), because wide letters wrap sooner.
- Use tabular numerals for prices and statistics so digits line up.
- Avoid long uppercase text; uppercase is reserved for the logo and very short labels.
- Check layouts at 320 px width.

## 9.3 Typography Recommendations

| UI Element             | Typeface   | Weight  |
| ---------------------- | ---------- | ------- |
| Main headings          | Montserrat | 700–800 |
| Section headings       | Montserrat | 700     |
| Subheadings            | Montserrat | 600     |
| Product names          | Montserrat | 600     |
| Body text              | Montserrat | 400     |
| Navigation             | Montserrat | 500–600 |
| Buttons                | Montserrat | 600     |
| Form labels            | Montserrat | 500–600 |
| Supporting text        | Montserrat | 400–500 |
| Pricing and statistics | Montserrat | 700     |

## 9.4 Recommended Mobile Typography Scale

These values are initial design recommendations and may be adjusted following accessibility and usability testing.

| Element              | Recommended Size |
| -------------------- | ---------------- |
| Primary page heading | 24–28px          |
| Section heading      | 18–20px          |
| Product name         | 16–18px          |
| Body text            | 16px             |
| Form labels          | 15–16px          |
| Buttons              | 16px             |
| Supporting text      | 14–16px          |
| Price emphasis       | 18–22px          |

### Typography Rules

- Prioritize readability over compactness.
- Avoid unnecessarily light font weights.
- Maintain sufficient line height.
- Use consistent typographic hierarchy.
- Avoid excessive uppercase content.
- Prevent text clipping and overlap.
- Support user font scaling and browser zoom.
- Do not use placeholder text as the only form label.
- Do not add other font families to platform pages.

## 9.5 Logo Typography

The wordmark is Montserrat artwork converted to outlines. Sharing the family with the interface does not mean the
logo may be typed as text: always use the logo files or the `Logo` component.

---

# 10. Visual Design Language

Desanara should maintain a modern, warm, and approachable interface.

### Recommended Characteristics

- Clean layouts.
- Balanced whitespace.
- Rounded but restrained corners.
- Soft neutral backgrounds.
- Hijau Desanara (`#387B4C`) primary actions.
- Clear cards and information groups.
- Subtle shadows.
- Simple, recognizable icons.
- High-quality product photography.
- Consistent component hierarchy.
- Lightweight nature-inspired accents.

### Avoid

- Excessively dense interfaces.
- Government-portal aesthetics.
- Heavy gradients (the logo gradient belongs to the logo and app icon only).
- Overly decorative elements.
- Unnecessary glassmorphism.
- Complex animated effects.
- Excessively small text.
- Ambiguous icon-only actions.
- Visual patterns that reduce usability.

The public application may be more expressive and image-oriented.

The seller application may be more functional and structured.

Both must remain recognizable as Desanara.

---

# 11. Application Experience Guidelines

## 11.1 Public / Customer Application

**Experience Direction:**

Modern, visually engaging, intuitive product discovery.

### Priorities

- Product imagery.
- Village identity.
- Simple navigation.
- Product search.
- Product categories.
- Clear product information.
- Transparent seller details.
- Easy direct contact.

### Recommended Product Card Information

1. Product photo.
2. Product name.
3. Village of origin.
4. Price, when available.
5. Action to view details.

### Product Detail Experience

Prioritize:

- Product identity.
- Origin village.
- Producer information.
- Product descriptions.
- Pricing and availability when provided.
- Direct WhatsApp contact.

Recommended calls to action:

- "Pesan via WhatsApp"
- "Chat Penjual"
- "Hubungi Penjual"

Do not imply that a WhatsApp redirect represents a completed transaction.

## 11.2 Seller / Management Application

**Experience Direction:**

Clear, task-oriented, predictable, and reassuring.

### Priorities

- Simple navigation.
- Efficient product management.
- Readable forms.
- Clear action labels.
- Visible status information.
- Helpful feedback.
- Error prevention.
- Easy recovery.

### Recommended Patterns

- Explicit action buttons.
- Clearly grouped forms.
- Understandable validation messages.
- Visible save and cancel actions.
- Confirmation for destructive operations.
- Consistent placement of common controls.
- Simple empty states with suggested next actions.

Do not treat a mobile management interface as a compressed desktop dashboard.

Design mobile management interactions intentionally.

---

# 12. Accessibility & Inclusive Design

Use **WCAG 2.2 AA** as the baseline accessibility target.

### Design Requirements

- Maintain sufficient text contrast.
- Provide visible focus indicators.
- Use appropriate touch-target sizes.
- Avoid communicating meaning through color alone.
- Support text resizing up to 200% without loss of essential content or functionality.
- Ensure navigation remains understandable.
- Provide accessible labels for controls.
- Use clear error messages.
- Maintain logical content order.
- Avoid unnecessary interaction complexity.

### Cross-Generational Considerations

- Do not assume older users are unfamiliar with technology.
- Do not assume younger users prefer complex interactions.
- Use recognizable navigation patterns.
- Keep essential actions visible.
- Reduce unnecessary cognitive load.
- Validate assumptions with real users where possible.

The interface should remain useful for people with different needs, experiences, and device capabilities.

---

# 13. Brand Voice & Microcopy

The primary interface language is **Bahasa Indonesia**.

Tone characteristics:

- Friendly.
- Clear.
- Respectful.
- Natural.
- Direct.
- Encouraging without exaggeration.

### Public-Facing Examples

- "Jelajahi Produk Desa"
- "Temukan Karya Lokal"
- "Kenali Desa Asalnya"
- "Lihat Produk"
- "Hubungi Penjual"

### Seller-Facing Examples

- "Tambah Produk"
- "Kelola Produk"
- "Ubah Informasi"
- "Simpan Perubahan"
- "Produk Berhasil Disimpan"
- "Yakin ingin menghapus produk ini?"

### Avoid

- Unnecessary technical jargon.
- Excessively bureaucratic language.
- Misleading claims.
- Unclear calls to action.
- Overly casual slang in important workflows.
- Terminology that changes between similar screens.

---

# 14. UX Validation Strategy

Desanara should be evaluated using representative tasks from both user segments.

## Seller / Management Validation

Evaluate whether users can:

- Add a product without assistance.
- Upload product photos.
- Edit existing product information.
- Understand validation errors.
- Confirm that changes were saved.
- Recover from accidental actions.

## Public / Customer Validation

Evaluate whether users can:

- Find relevant products.
- Recognize the village of origin.
- Navigate village profiles.
- Identify sellers.
- Find direct contact actions.
- Understand how ordering works.

## Typography Validation

Validate **Montserrat** on realistic UI screens on an affordable Android phone, particularly:

- Product catalog.
- Product detail pages.
- Product management screens.
- Add/edit product forms.
- Seller lists and operational information.

Evaluate:

- Reading comfort.
- Recognition of controls.
- Error rates.
- Task completion.
- Perceived visual clarity.
- Performance at different text sizes.

If Montserrat causes reading problems in testing (for example, long product names or dense forms), adjust size,
weight, and spacing first before considering another family.

---

# 15. Instructions for AI Development Agents

This document describes Desanara's approved brand identity and UI/UX principles.

**The project's technical architecture and code structure have already been established.**

Do not restructure the project, change the technology stack, or introduce unrelated implementation requirements as part of this specification.

Focus exclusively on implementing and maintaining the approved brand direction.

### Mandatory Guidelines

1. Preserve the approved Desanara logo.
2. Use the official tagline consistently.
3. Maintain the color palette in section 8 (values from the logo SVG files).
4. Use Montserrat as the only UI font on platform pages and the dashboard.
5. Use the logo files or `Logo` / `LogoMark` components; never type the wordmark.
6. Do not redesign the logo.
7. Prioritize mobile-first design.
8. Support both major audience segments.
9. Use familiar interaction patterns.
10. Maintain readable typography and accessible controls.
11. Ensure consistency across public and management applications.
12. Preserve village origin as core product information.
13. Use clear WhatsApp contact actions.
14. Do not introduce unapproved checkout functionality.
15. Preserve existing project functionality and conventions.

### Design Decision Priority

When balancing competing design goals:

1. Usability and accessibility.
2. Task clarity and successful completion.
3. Familiarity and consistency.
4. Approved brand identity.
5. Visual aesthetics and decorative details.

Visual polish should enhance usability rather than compete with it.

---

# 16. Final Brand Summary

| Attribute                     | Decision                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| **Brand Name**                | Desanara                                                     |
| **Brand Meaning**             | Desa Nusantara                                               |
| **Tagline**                   | Ragam Karya, Cerita Nusantara.                               |
| **Brand Personality**         | Warm, modern, authentic, approachable                        |
| **Primary Color**             | Hijau Desanara `#387B4C`                                     |
| **Secondary Color**           | Daun `#6CAC4E`                                               |
| **Highlight Color**           | Tunas `#9DD950`                                              |
| **Accent Colors**             | Mentari `#E3A84F`, Bata `#C2612C`                            |
| **Background**                | Krem `#F9F4E7`                                               |
| **Logo**                      | Leaf "d" mark with outlined Montserrat wordmark              |
| **UI Font**                   | Montserrat (everywhere)                                      |
| **Primary Platform Strategy** | Mobile-first                                                 |
| **Primary UX Principle**      | Familiarity First, Modernity with Purpose                    |
| **Primary Audience A**        | Sellers, MSMEs, Village Administrators                       |
| **Primary Audience B**        | Public Visitors and Customers                                |
| **Product Experience**        | Village-centered product discovery and direct seller contact |

---

# 17. Final Direction

Desanara must feel like a modern Indonesian digital product that naturally accommodates people across generations.

The public application should be contemporary and visually engaging without sacrificing clarity.

The seller and management application should make administrative tasks understandable, predictable, and comfortable for users with different levels of digital experience.

The two applications should have different interaction priorities while maintaining a unified brand identity.

**The objective is not to design separate interfaces for different generations. The objective is to build experiences that remain intuitive regardless of generation.**

### Core Statement

**One Brand. Two Experiences. Designed for Every Generation.**

---

**End of Brand Identity & Inclusive UI/UX Guidelines — Version 1.3**
