# Onboarding developer baru

Hari pertama:

1. Baca `AGENTS.md` (aturan dan peta repo), lalu `docs/product/vision.md` dan `docs/architecture/overview.md`.
2. Setup lokal: [local-setup.md](local-setup.md).
3. Login dashboard dengan akun demo dan jelajahi API di `http://localhost:8787/docs`.
4. Baca ADR di `docs/adr/` — terutama alasan memakai Hono, Supabase-sebagai-Postgres, dan HeroUI v3.
5. Pasang tooling AI: restart Claude Code di repo ini lalu `/mcp` (HeroUI, Supabase, Vercel), dan pasang HeroUI skills:
   `curl -fsSL https://heroui.com/install | bash -s heroui-react`.
6. Ambil satu tugas kecil, ikuti [feature-end-to-end.md](feature-end-to-end.md).

Saat memakai AI: minta agent membaca `AGENTS.md` dulu, review setiap diff, dan jangan merge tanpa test serta CHANGELOG.
