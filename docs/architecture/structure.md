# Repository structure

```text
umkm-app/
├── AGENTS.md / CLAUDE.md      # agent entry point (CLAUDE.md imports AGENTS.md)
├── apps/
│   ├── web/src/
│   │   ├── app/[locale]/      # public routes: /, /jelajah, /tentang, /desa/[village], /desa/[village]/[business], /produk/[product]
│   │   ├── components/        # web-only components
│   │   ├── i18n/              # next-intl routing, request config, navigation
│   │   ├── lib/api.ts         # server-side API client
│   │   └── proxy.ts           # next-intl locale negotiation (Next.js 16 "proxy")
│   ├── dashboard/src/
│   │   ├── app/login/         # /login (?next= returns to the page that asked for a session)
│   │   ├── app/(app)/         # behind the session check: / (role-aware home), /businesses, /businesses/new, /businesses/[id], /businesses/[id]/edit, /businesses/[id]/products/new, /products/[id]
│   │   ├── components/        # app shell, business pages, form fields
│   │   ├── lib/               # api client, session, nav rules, form drafts, upload-image, api-errors
│   │   └── messages/id.json   # UI copy (dashboard is Indonesian only)
│   └── api/src/
│       ├── app.ts             # createApp(): middleware + module mounting
│       ├── index.ts           # Bun entry (reads env, builds deps)
│       ├── env.ts             # env validation
│       ├── vercel.ts          # Node entry for Vercel (bundled by scripts/build-vercel.ts)
│       ├── lib/               # errors, router factory, actor loader, audit, storage (R2), context types
│       ├── middleware/        # session, requireUser
│       └── modules/<name>/    # <name>.routes.ts / .service.ts / .repository.ts / .schema.ts
├── packages/                  # see AGENTS.md table
├── docs/                      # product (ID), architecture (EN), adr (EN), guides (ID), plan, CHANGELOG
├── .agents/skills/            # canonical agent skills; .claude/skills/* point here
├── .github/                   # CI, changelog check, PR template
├── .plop/                     # `bun run generate` scaffolds
└── docker/                    # local Postgres, API image, Caddy
```

## Naming

- Files and route segments: kebab-case. React components and types: PascalCase.
- API module files: `<module>.routes.ts`, `<module>.service.ts`, `<module>.repository.ts`, `<module>.schema.ts`.
- Validation schemas: `<entity>CreateSchema`, `<entity>UpdateSchema`; inferred types `<Entity>CreateInput`.
- Database: tables plural snake_case (`product_images`); TypeScript columns camelCase (Drizzle `casing: 'snake_case'`).
- Workspace packages are imported as `@repo/<name>`; apps use `@/*` for their own `src`.

## Adding an app later

`apps/mobile` (Expo) will reuse `@repo/validators`, `@repo/api-client`, `@repo/auth/permissions`
and `@repo/i18n`. HeroUI has a React Native flavour (HeroUI Native) with its own MCP server.
