import { BusinessDetail } from '@/components/business/business-detail'

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <BusinessDetail id={id} />
}
