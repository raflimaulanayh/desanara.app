# 0004 — HeroUI v3 + Tailwind CSS v4

- Status: Accepted (2026-11-01)

## Decision

UI built with HeroUI v3 (React Aria based, accessible) on Tailwind CSS v4 (CSS-first config).
Theme tokens live in `packages/ui/src/theme.css`; each app imports `tailwindcss`, `@heroui/styles`, then the theme.

## Consequences

- v3 API differs from v2/NextUI (compound components such as `Card.Header`, `TextField` + `Label` + `Input`,
  `onPress`). Most online examples and model memory are v2 — always check the HeroUI MCP server or docs.
- No HeroUI provider is required; dark mode is a `.dark` class / `data-theme` on `<html>`.
- HeroUI components are interactive; keep them in `'use client'` components or let Server Components render
  them as leaves, and keep data fetching in Server Components.
- Tailwind must scan shared packages: `@source '../../../../packages/ui/src'` in each app's `globals.css`.
