# 0002 — Hono for the API

- Status: Accepted (2026-11-01)

## Context

The team knows TypeScript. The API may run on a small campus VPS. A mobile app is planned.
Go and Rust were considered because they are popular for backends.

## Decision

Hono on Bun, organised as a modular monolith (`routes → service → repository`), OpenAPI via `@hono/zod-openapi`,
docs via Scalar, auth via Better Auth.

## Consequences

- Low memory use (fits a 1 GB VPS); can also run on Node, Bun or Cloudflare Workers if hosting changes.
- Hono RPC gives web, dashboard and mobile typed clients for free.
- Drizzle and Better Auth are TypeScript-native, so one language across the stack.
- Less structure than NestJS: we enforce it with module conventions, the plop generator and code review.

## Alternatives

- Go — efficient and simple, but a new language for the team during a 6-week MVP and no shared types.
- Rust — steep learning curve; unjustified for a CRUD catalogue.
- NestJS — strong structure but heavy and boilerplate-heavy for three developers.
- Express — familiar, but no built-in typing to the clients.
  Revisit only if a specific service becomes CPU-bound (it could then be a separate `apps/<service>` in Go).
