import {
  parseVillageTheme,
  readableForeground,
  type VillageFont,
  type VillageRadius,
  type VillageTheme,
} from '@repo/validators'
import type { CSSProperties } from 'react'

/**
 * Turns a stored village theme into attributes for the wrapper of every village-scoped page
 * (village, its businesses and products). Rendered on the server → no flash of the default theme.
 *
 *   <div {...villageThemeAttributes(village.theme)}>…</div>
 *
 * `[data-village-theme]` in theme.css re-declares HeroUI's derived variables (hover, soft, focus,
 * field radius) so they are recomputed from the village accent instead of the platform one.
 */

const RADIUS: Record<VillageRadius, string> = {
  sharp: '0.25rem',
  rounded: '0.75rem',
  pill: '1.25rem',
}

/** CSS variables set by next/font in apps/web (see docs/architecture/village-theming.md). */
const FONT_VARIABLE: Record<VillageFont, string> = {
  'barlow-condensed': 'var(--font-barlow-condensed)',
  bitter: 'var(--font-bitter)',
  nunito: 'var(--font-nunito)',
  poppins: 'var(--font-poppins)',
}

export interface VillageThemeOptions {
  /**
   * Apply the village corner style. Product pages are part of the shared catalogue, so they keep the
   * platform radius and take only the village ink and face (PLAN-product-reviews).
   */
  radius?: boolean
}

export function villageThemeStyle(
  theme: VillageTheme,
  { radius = true }: VillageThemeOptions = {},
): CSSProperties {
  return {
    '--accent': theme.accent,
    '--accent-foreground': readableForeground(theme.accent),
    ...(radius ? { '--radius': RADIUS[theme.radius] } : {}),
    '--village-font': FONT_VARIABLE[theme.font],
  } as CSSProperties
}

/** Accepts the raw JSONB from the API; invalid values fall back to the default theme. */
export function villageThemeAttributes(raw: unknown, options?: VillageThemeOptions) {
  const theme = parseVillageTheme(raw)
  return {
    'data-village-theme': theme.template,
    style: villageThemeStyle(theme, options),
  } as const
}
