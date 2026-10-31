# Architecture Decision Records

An ADR records **why** a decision was made, so future HIMA boards (and AI agents) do not undo it by accident.

- One file per decision: `NNNN-short-title.md`, never renumbered.
- Status: Proposed → Accepted → (Superseded by NNNN | Deprecated).
- To change a decision, write a new ADR that supersedes the old one; edit the old one only to set its status.

| #                                          | Decision                                                                    | Status   |
| ------------------------------------------ | --------------------------------------------------------------------------- | -------- |
| [0001](0001-turborepo-bun-monorepo.md)     | Turborepo + Bun monorepo, backend in the same repo                          | Accepted |
| [0002](0002-hono-backend.md)               | Hono (TypeScript) for the API instead of Go/Rust/NestJS                     | Accepted |
| [0003](0003-supabase-as-plain-postgres.md) | Supabase only as plain Postgres; Drizzle migrations are the source of truth | Accepted |
| [0004](0004-heroui-v3-tailwind-v4.md)      | HeroUI v3 + Tailwind CSS v4                                                 | Accepted |
| [0005](0005-whatsapp-checkout-mvp.md)      | WhatsApp checkout for the MVP; payment gateway later                        | Accepted |
| [0006](0006-english-url-segments.md)       | English URL segments, content-language slugs                                | Accepted |
| [0007](0007-village-theming.md)            | Per-village theming: curated tokens + code templates, no custom CSS         | Accepted |

Template: copy any ADR and keep the headings (Context, Decision, Consequences, Alternatives).
