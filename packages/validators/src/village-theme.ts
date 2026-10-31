import { z } from 'zod'
import { contrastRatio, HEX_COLOR, WHITE } from './color'

/**
 * Per-village branding (ADR 0007). Stored as JSONB on `villages.theme` (published) and
 * `villages.theme_draft` (being edited). Templates are React code in apps/web; the database
 * only stores which template and which tokens.
 *
 * Changing this shape: bump `version` and keep `parseVillageTheme` able to read old versions.
 */

export const villageTemplates = ['classic'] as const
export const villageFonts = ['plus-jakarta-sans', 'nunito', 'poppins', 'lora'] as const
export const villageRadii = ['sharp', 'rounded', 'pill'] as const

/** Minimum contrast of the accent against the white page (WCAG 1.4.11 non-text contrast). */
export const MIN_ACCENT_CONTRAST = 3

export const villageThemeSchema = z.object({
  version: z.literal(1),
  template: z.enum(villageTemplates),
  accent: z
    .string()
    .regex(HEX_COLOR, 'Gunakan format warna #RRGGBB')
    .refine((hex) => contrastRatio(hex, WHITE) >= MIN_ACCENT_CONTRAST, {
      message: 'Warna terlalu terang, tidak terbaca di latar putih. Pilih warna yang lebih gelap.',
    }),
  font: z.enum(villageFonts),
  radius: z.enum(villageRadii),
})

export type VillageTheme = z.infer<typeof villageThemeSchema>
export type VillageTemplate = VillageTheme['template']
export type VillageFont = VillageTheme['font']
export type VillageRadius = VillageTheme['radius']

export const DEFAULT_VILLAGE_THEME: VillageTheme = {
  version: 1,
  template: 'classic',
  accent: '#2e7d32',
  font: 'plus-jakarta-sans',
  radius: 'rounded',
}

/** Ready-made palettes shown first in the dashboard editor (all pass the contrast rule). */
export const villageThemePresets = [
  { id: 'sawah', label: 'Hijau Sawah', accent: '#2e7d32' },
  { id: 'laut', label: 'Biru Laut', accent: '#1565c0' },
  { id: 'kopi', label: 'Cokelat Kopi', accent: '#6d4c41' },
  { id: 'bata', label: 'Merah Bata', accent: '#b23a1e' },
  { id: 'senja', label: 'Jingga Senja', accent: '#c2410c' },
  { id: 'anggrek', label: 'Ungu Anggrek', accent: '#7b1fa2' },
] as const

/** Partial update sent by the dashboard editor; merged onto the current draft. */
export const villageThemeUpdateSchema = villageThemeSchema.omit({ version: true }).partial()

/**
 * Reads whatever is stored in the database. Never throws: invalid or missing values fall back
 * field by field to the default, so a bad row can never break a public page.
 */
export function parseVillageTheme(raw: unknown): VillageTheme {
  if (raw && typeof raw === 'object') {
    const merged = { ...DEFAULT_VILLAGE_THEME, ...(raw as Record<string, unknown>), version: 1 }
    const full = villageThemeSchema.safeParse(merged)
    if (full.success) return full.data
    const result: Record<string, unknown> = { ...DEFAULT_VILLAGE_THEME }
    for (const key of ['template', 'accent', 'font', 'radius'] as const) {
      const field = villageThemeSchema.shape[key].safeParse(merged[key])
      if (field.success) result[key] = field.data
    }
    return result as VillageTheme
  }
  return DEFAULT_VILLAGE_THEME
}
