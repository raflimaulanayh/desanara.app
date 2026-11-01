import { BRAND_NAME, buildWhatsAppLink, formatRupiah, type Locale } from '@repo/i18n'

export interface OrderLine {
  name: string
  unit: string | null
  price: number
  quantity: number
}

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
  const id: Locale = 'id'
  const rows = [
    'NOTA PESANAN',
    `Kepada: ${input.businessName} (${input.villageName})`,
    '',
    `${line.quantity} × ${line.name}${line.unit ? ` (${line.unit})` : ''}`,
    `@ ${formatRupiah(line.price, id)} = ${formatRupiah(total, id)}`,
    '',
    `Jumlah: ${formatRupiah(total, id)}`,
  ]
  if (input.buyerName) rows.push(`Atas nama: ${input.buyerName}`)
  if (input.note) rows.push(`Catatan: ${input.note}`)
  rows.push('', `Produk: ${input.productUrl}`, `Dikirim lewat ${BRAND_NAME}`)
  return rows.join('\n')
}

export function orderLink(phone: string, message: string) {
  return buildWhatsAppLink(phone, message)
}
