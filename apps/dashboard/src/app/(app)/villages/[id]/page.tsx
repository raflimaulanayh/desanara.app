import { VillageSettingsPage } from '@/components/village/village-settings'

export default async function VillageSettingsRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <VillageSettingsPage id={id} />
}
