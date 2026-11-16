import { Container } from '@repo/ui/components/container'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { BrandMark } from './brand-mark'
import { Logo } from './brand/logo'

/** Footer: what the platform is, where to go, and the required credit to HIMA SI and SATU University. */
export async function SiteFooter() {
  const t = await getTranslations('footer')
  return (
    <footer className="bg-wash border-line mt-16 border-t">
      <Container className="grid gap-8 py-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Logo size="md" />
          <p className="text-muted mt-3 max-w-[52ch] text-sm leading-relaxed">{t('about')}</p>
          <nav aria-label={t('links')} className="mt-4 flex gap-5 text-sm font-semibold">
            <Link href="/jelajah" className="hover:text-accent">
              {t('explore')}
            </Link>
            <Link href="/tentang" className="hover:text-accent">
              {t('about_link')}
            </Link>
            <Link href="/tentang/kredit-foto" className="hover:text-accent">
              {t('credits')}
            </Link>
          </nav>
        </div>
        <div className="text-sm">
          <p className="text-muted text-xs font-semibold tracking-wide uppercase">{t('byline')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-4">
            <BrandMark mark="himasif" height={30} />
            <BrandMark mark="satu" height={40} />
          </div>
          <p className="text-muted mt-3">HIMA Sistem Informasi · SATU University</p>
        </div>
      </Container>
      <Container className="text-muted border-line border-t py-4 text-xs">
        {t('credit', { year: new Date().getFullYear() })}
      </Container>
    </footer>
  )
}
