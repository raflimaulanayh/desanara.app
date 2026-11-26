import { mediaUrl } from './media'

const regencyCrests = new Map([
  ['32.04', { src: '/media/seed/villages/bandung-regency.webp', name: 'Kabupaten Bandung' }],
  ['32.05', { src: '/media/regency-crests/garut.webp', name: 'Kabupaten Garut' }],
  ['32.11', { src: '/media/regency-crests/sumedang.webp', name: 'Kabupaten Sumedang' }],
])

export function villageCrest(
  { logoKey, regionCode }: { logoKey: string | null; regionCode: string | null },
  preview = false,
) {
  const original = mediaUrl(logoKey, preview)
  if (original) return { url: original, regency: null }
  const code = regionCode?.split('.').slice(0, 2).join('.')
  const fallback = code ? regencyCrests.get(code) : undefined
  return { url: fallback?.src ?? null, regency: fallback?.name ?? null }
}
