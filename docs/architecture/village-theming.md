# Village theming

Decision and reasons: [ADR 0007](../adr/0007-village-theming.md).

## Shape

```ts
// @repo/validators — villageThemeSchema
{ version: 1, template: 'classic', accent: '#1f3a8a', font: 'barlow-condensed', radius: 'sharp' }
```

| Field         | Values                                             | Notes                                            |
| ------------- | -------------------------------------------------- | ------------------------------------------------ |
| `template`    | `classic` (more later)                             | React component in `apps/web/src/templates/<id>` |
| `accent`      | `#RRGGBB`, contrast ≥ 3:1 on white                 | presets in `villageThemePresets`                 |
| `font`        | `plus-jakarta-sans`, `nunito`, `poppins`, `lora`   | loaded with `next/font` as `--font-<id>`         |
| `radius`      | `sharp` 0.25rem, `rounded` 0.75rem, `pill` 1.25rem | drives HeroUI `--radius`                         |
| logo / banner | `villages.logoKey`, `villages.bannerKey`           | R2 keys, not in the JSON                         |

Storage: `villages.theme` (published, null = default), `villages.theme_draft`, `villages.theme_published_at`.

## Rendering (apps/web)

```tsx
import { villageThemeAttributes } from '@repo/ui/village-theme'

// app/[locale]/villages/[village]/layout.tsx — wraps the village, its businesses and products
;<div {...villageThemeAttributes(village.theme)}>{children}</div>
```

- Server-rendered inline variables → no flash of the platform theme.
- `[data-village-theme]` (packages/ui/src/theme.css) recomputes HeroUI's derived variables from the village accent.
- Load the curated fonts once in the web root layout with `next/font/google`, exposing
  `--font-barlow-condensed`, `--font-bitter`, `--font-nunito`, `--font-poppins` (`apps/web/src/lib/fonts.ts`; village faces are not preloaded).
- Use HeroUI tokens (`bg-accent`, `text-accent-foreground`, `rounded-[var(--radius)]`) inside templates; never
  hard-code the platform green there.

## Editing (apps/dashboard, planned)

1. `GET /v1/villages/:id/theme` → `{ published, draft }` (requires `village.customize_theme`).
2. `PATCH /v1/villages/:id/theme/draft` with `villageThemeUpdateSchema` → merged into the draft, validated.
3. Live preview: render the template with the draft inside the dashboard (same `villageThemeAttributes`).
4. `POST /v1/villages/:id/theme/publish` → copy draft to `theme`, set `theme_published_at`, write `audit_logs`,
   revalidate the village pages on web (`revalidatePath`/tag).
5. "Kembalikan ke default" → `theme = null`.

## Adding a template

1. Add the id to `villageTemplates` in `packages/validators/src/village-theme.ts`.
2. Create `apps/web/src/templates/<id>/` exporting the same props as `classic`.
3. Register it in the template map; add a thumbnail for the editor.
4. Test at 360 px and with every preset colour. Update this page and the CHANGELOG.
