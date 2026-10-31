---
name: pre-pr-review
description: Checklist to run before opening a pull request or finishing an agent task in this repo.
---

# Pre-PR review

Run `bun run check:all` first. Then confirm each item (fix, don't just report):

- [ ] Every new mutation/private read calls `assertCan` in the service; resource ids come from DB rows.
- [ ] Queries are tenant-scoped (`villageId`) and exclude soft-deleted rows.
- [ ] No frontend import of `@repo/db` / `@repo/auth/server`; API calls go through `@repo/api-client`.
- [ ] Schema changes have a generated migration committed; `data-model.md` updated.
- [ ] Input validated with shared Zod schemas; errors use the standard envelope.
- [ ] Tests: permissions (allowed + cross-village denied), service/route behaviour.
- [ ] UI copy in next-intl messages (web: ID **and** EN); HeroUI v3 APIs (no v2 imports like `CardBody`).
- [ ] No secrets, tokens, or real personal data in code, seed, logs, or screenshots.
- [ ] `docs/CHANGELOG.md` entry in the required format; affected docs/ADRs/plans updated.
- [ ] Demo data stays flagged `isSeed`.

For a deeper pass use the built-in `code-review` and `security-review` skills.
