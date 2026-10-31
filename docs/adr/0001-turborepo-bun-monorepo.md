# 0001 — Turborepo + Bun monorepo with the backend inside

- Status: Accepted (2026-11-01)

## Context

Three developers, heavy AI assistance, a web app, a dashboard, an API, and a mobile app within a year.
The previous HIMA/Sawala project kept the backend in a separate repo and needed a 56 KB integration document to keep
frontend and backend contracts in sync.

## Decision

One repository: `apps/{web,dashboard,api}` + `packages/*`, Turborepo for tasks, Bun as package manager and API runtime.

## Consequences

- Shared Zod validators and typed RPC client: a backend change breaks the frontend at type-check time, not in production.
- One PR can ship endpoint + UI + migration + docs; agents see both sides of every contract.
- Deploys must be filtered by path (Vercel ignored build step; API workflow only on `apps/api/**`, `packages/db/**`, …).
- The API Docker image is built with `turbo prune api --docker` so it contains only what the API needs.
- ESLint import boundaries stop frontends from importing `@repo/db` or `@repo/auth/server`.

## Alternatives

- Separate repos — rejected: contract drift, duplicated types, double onboarding.
- pnpm + Node — fine, but Bun is faster, runs TypeScript directly, and the team already used it.
