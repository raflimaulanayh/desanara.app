import { villageThemeAttributes } from '@repo/ui/village-theme'
import type { ReactNode } from 'react'

/** Applies a village's ink, corner style and display face to everything inside (ADR 0007). */
export function VillageTheme({ theme, children }: { theme: unknown; children: ReactNode }) {
  return <div {...villageThemeAttributes(theme)}>{children}</div>
}
