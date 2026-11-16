import { ProductNew } from '@/components/product/product-new'

export default async function NewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductNew businessId={id} />
}
