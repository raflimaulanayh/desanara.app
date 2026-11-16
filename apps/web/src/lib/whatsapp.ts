import { BRAND_NAME, buildWhatsAppLink, formatRupiah, type Locale } from '@repo/i18n'

export interface OrderLine {
  name: string
  unit: string | null
  /** Selling price; 0 = free. */
  price: number
  /** Normal price shown struck through, repeated so the seller honours the promo. */
  compareAtPrice?: number | null
  quantity: number
}

const rupiah = (n: number) => (n === 0 ? 'Gratis' : formatRupiah(n, 'id' satisfies Locale))

/**
 * The order "nota" sent to the seller. Always written in Indonesian: the seller reads it,
 * whatever language the buyer browses in.
 */
export function buildOrderMessage(input: {
  businessName: string
  villageName: string
  line: OrderLine
  buyerName?: string
  note?: string
  productUrl: string
}): string {
  const { line } = input
  const total = line.price * line.quantity
  const normal = line.compareAtPrice ? ` (harga normal ${rupiah(line.compareAtPrice)})` : ''
  const rows = [
    'NOTA PESANAN',
    `Kepada: ${input.businessName} (${input.villageName})`,
    '',
    `${line.quantity} × ${line.name}${line.unit ? ` (${line.unit})` : ''}`,
    line.price === 0 ? `@ Gratis${normal}` : `@ ${rupiah(line.price)}${normal} = ${rupiah(total)}`,
    '',
    `Jumlah: ${rupiah(total)}`,
  ]
  if (input.buyerName) rows.push(`Atas nama: ${input.buyerName}`)
  if (input.note) rows.push(`Catatan: ${input.note}`)
  rows.push('', `Produk: ${input.productUrl}`, `Dikirim lewat ${BRAND_NAME}`)
  return rows.join('\n')
}

export function orderLink(phone: string, message: string) {
  return buildWhatsAppLink(phone, message)
}
