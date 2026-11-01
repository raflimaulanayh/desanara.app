import { Container } from '@repo/ui/components/container'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { BrandMark } from './brand-mark'
import { LogoStamp } from './brand/logo'

/**
 * Closing page of the book. HIMA SI and SATU University are credited in text; their logos are
 * required but not yet supplied (PRODUCT.md) — never draw or approximate them.
 */
export async function SiteFooter() {
  const t = await getTranslations('footer')
  return (
    <footer className="mt-8 border-t-[3px] border-double border-[var(--nota-ink)]">
      <Container className="grid gap-8 py-10 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <LogoStamp tagline={t('tagline')} />
          <p className="text-muted mt-6 max-w-[52ch] text-sm leading-relaxed">{t('about')}</p>
        </div>
        <div className="text-sm">
          <p className="font-print text-nota-ink text-xs font-semibold tracking-[0.16em] uppercase">
            {t('byline')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-4">
            <BrandMark mark="himasif" height={34} />
            <BrandMark mark="satu" height={44} />
          </div>
          <p className="text-muted mt-3">HIMA Sistem Informasi · SATU University</p>
          <nav aria-label={t('links')} className="mt-4 flex gap-4">
            <Link href="/explore" className="hover:text-accent underline">
              {t('explore')}
            </Link>
            <Link href="/about" className="hover:text-accent underline">
              {t('about_link')}
            </Link>
          </nav>
        </div>
      </Container>
      <Container className="text-muted border-nota-rule border-t py-4 text-xs">
        {t('credit', { year: new Date().getFullYear() })}
      </Container>
    </footer>
  )
}
