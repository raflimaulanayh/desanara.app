import { BusinessEdit } from '@/components/business/business-edit'

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <BusinessEdit id={id} />
}
