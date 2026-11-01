import { formatRupiah } from '@repo/i18n'
import { getLocale, getTranslations } from 'next-intl/server'
import type { ProductSummary } from '@/lib/data'
import { asLocale, pick } from '@/lib/localize'
import { LocaleLink } from './link'
import { NotaRow } from './nota/nota'
import { Stamp } from './stamp'

/** Products as lines on a nota. `crossVillage` adds the village ink dot and village name. */
export async function ProductRows({
  products,
  crossVillage = false,
  showBusiness = true,
}: {
  products: ProductSummary[]
  crossVillage?: boolean
  showBusiness?: boolean
}) {
  const locale = await getLocale()
  const t = await getTranslations('product')
  return products.map((p) => {
    const meta = [showBusiness ? p.business.name : null, crossVillage ? p.village.name : null]
      .filter(Boolean)
      .join(' · ')
    return (
      <NotaRow
        key={p.id}
        href={`/products/${p.slug}`}
        name={pick(locale, p.name, p.nameEn)}
        meta={meta || undefined}
        unit={p.unit}
        price={formatRupiah(p.price, asLocale(locale))}
        marker={crossVillage ? p.village.accent : undefined}
        stamp={
          p.isAvailable ? undefined : (
            <Stamp tone="muted" size="sm" rotate={0}>
              {t('unavailable')}
            </Stamp>
          )
        }
        linkComponent={LocaleLink}
      />
    )
  })
}
