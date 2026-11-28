import { BRAND_NAME, buildWhatsAppLink, formatRupiah, type Locale } from '@repo/i18n'

export interface OrderLine {
  name: string
  /** Selling price; 0 = free. */
  price: number
  /** Normal price shown struck through, repeated so the seller honours the promo. */
  compareAtPrice?: number | null
  quantity: number
}

/** How the buyer wants to receive the order. */
export type DeliveryMethod = 'pickup' | 'delivery' | 'courier'

export interface Buyer {
  name: string
  delivery?: DeliveryMethod
  /** District or town only (never a full address): enough for the seller to judge shipping. */
  area?: string
}

const rupiah = (n: number) => (n === 0 ? 'Gratis' : formatRupiah(n, 'id' satisfies Locale))

const DELIVERY: Record<DeliveryMethod, string> = {
  pickup: 'Ambil sendiri',
  delivery: 'Diantar penjual',
  courier: 'Kirim lewat ekspedisi',
}

export const orderTotal = (lines: OrderLine[]) =>
  lines.reduce((sum, line) => sum + line.price * line.quantity, 0)

/**
 * The order message sent to the seller: a friendly greeting, every item with its unit price, the total,
 * who is ordering and how they want to receive it. Always Indonesian: the seller reads it, whatever
 * language the buyer browses in. Plain "x" and "per item" read well on any phone.
 */
export function buildOrderMessage(input: {
  businessName: string
  villageName: string
  lines: OrderLine[]
  buyer?: Buyer
  note?: string
  productUrl: string
}): string {
  const lines = input.lines.filter((line) => line.quantity > 0)
  const rows = [`Halo ${input.businessName} (${input.villageName}), saya mau pesan:`, '']
  for (const line of lines) {
    const normal = line.compareAtPrice ? ` (harga normal ${rupiah(line.compareAtPrice)})` : ''
    rows.push(`${line.quantity} x ${line.name}`)
    rows.push(
      line.price === 0
        ? `   Gratis${normal}`
        : `   ${rupiah(line.price)} per item${normal} = ${rupiah(line.price * line.quantity)}`,
    )
  }
  rows.push('', `Total: ${rupiah(orderTotal(lines))}`)

  const buyer = input.buyer
  const details: string[] = []
  if (buyer?.name.trim()) details.push(`Nama: ${buyer.name.trim()}`)
  if (buyer?.delivery) {
    const area = buyer.delivery !== 'pickup' && buyer.area?.trim() ? ` ke ${buyer.area.trim()}` : ''
    details.push(`Pengambilan: ${DELIVERY[buyer.delivery]}${area}`)
  }
  if (input.note?.trim()) details.push(`Catatan: ${input.note.trim()}`)
  if (details.length) rows.push('', ...details)

  rows.push(
    '',
    'Apakah stoknya ada? Terima kasih.',
    `Produk: ${input.productUrl}`,
    `(Dikirim lewat ${BRAND_NAME})`,
  )
  return rows.join('\n')
}

export function orderLink(phone: string, message: string) {
  return buildWhatsAppLink(phone, message)
}
