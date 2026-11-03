import type { ReactNode } from 'react'
import { VillageTheme } from '@/components/village/village-theme'
import { getVillage } from '@/lib/data'

/** Every page under a village wears that village's theme. */
export default async function VillageLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ village: string }>
}) {
  const { village: slug } = await params
  const village = await getVillage(slug)
  return <VillageTheme theme={village.theme}>{children}</VillageTheme>
}
