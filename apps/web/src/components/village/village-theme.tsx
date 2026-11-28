import { villageThemeAttributes, type VillageThemeOptions } from '@repo/ui/village-theme'
import type { ReactNode } from 'react'

/** Applies a village's ink, corner style and display face to everything inside (ADR 0007). */
export function VillageTheme({
  theme,
  children,
  ...options
}: { theme: unknown; children: ReactNode } & VillageThemeOptions) {
  return <div {...villageThemeAttributes(theme, options)}>{children}</div>
}
