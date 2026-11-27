import { Container } from '@repo/ui/components/container'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { HIMASIF_SOCIALS, JOIN_HREF, SETTINGS_PATH, VILLAGES_PATH } from '@/lib/paths'
import { BrandMark } from './brand-mark'
import { Logo } from './brand/logo'
import { SOCIAL_ICONS } from './social-icons'

const link =
  'text-foreground/75 hover:text-accent inline-flex min-h-9 items-center gap-2 transition-colors'

/**
 * Footer: the platform in one line, three groups of links, and the required credit to HIMA SI and
 * SATU University (PRODUCT.md, Brand Commitments). White with a hairline, like the catalogue home.
 */
export async function SiteFooter() {
  const t = await getTranslations('footer')
  const groups = [
    {
      title: t('groupExplore'),
      items: [
        { href: '/jelajah', label: t('products') },
        { href: VILLAGES_PATH, label: t('villages') },
      ],
    },
    {
      title: t('groupAbout'),
      items: [
        { href: '/tentang', label: t('about_link') },
        { href: JOIN_HREF, label: t('join') },
        { href: '/tentang/kredit-foto', label: t('credits') },
        { href: SETTINGS_PATH, label: t('settings') },
      ],
    },
  ]

  return (
    <footer className="bg-surface border-line mt-16 border-t">
      <Container className="grid gap-10 pt-12 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 lg:pt-16">
        <div>
          <Logo size="md" />
          <p className="text-accent mt-5 text-xl leading-snug tracking-[-0.01em]">
            Ragam Karya, Cerita Nusantara.
          </p>
          <p className="text-foreground/70 mt-3 max-w-[46ch] text-sm leading-relaxed">
            {t('about')}
          </p>
        </div>
        <nav aria-label={t('links')} className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="font-semibold">{group.title}</p>
              <ul className="mt-3 flex flex-col">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={link}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="font-semibold">{t('groupContact')}</p>
            <ul aria-label={t('socials')} className="mt-3 flex gap-2">
              {HIMASIF_SOCIALS.map(({ network, label, href }) => {
                const Icon = SOCIAL_ICONS[network]
                return (
                  <li key={network}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} @himasif.su`}
                      title={`${label} @himasif.su`}
                      className="border-line text-foreground/75 hover:border-accent hover:text-accent grid size-11 place-items-center rounded-full border transition-colors"
                    >
                      <Icon className="size-[1.125rem]" />
                    </a>
                  </li>
                )
              })}
            </ul>
            <ul className="mt-2 flex flex-col">
              <li>
                <Link href="/tentang#bermitra" className={link}>
                  {t('partner')}
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </Container>
      <Container>
        <div className="border-line flex flex-col gap-4 border-t py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="text-muted text-xs font-semibold">{t('byline')}</span>
            <BrandMark mark="himasif" height={26} />
            <BrandMark mark="satu" height={34} />
          </div>
          <p className="text-muted max-w-[44ch] text-xs leading-relaxed sm:text-right">
            {t('programme')}
          </p>
        </div>
        <div className="text-muted border-line flex flex-col gap-3 border-t py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>{t('credit', { year: new Date().getFullYear() })}</p>
          <ul className="flex gap-5">
            <li>
              <Link
                href="/kebijakan-privasi"
                className="hover:text-accent inline-flex min-h-8 items-center"
              >
                {t('privacy')}
              </Link>
            </li>
            <li>
              <Link
                href="/syarat-ketentuan"
                className="hover:text-accent inline-flex min-h-8 items-center"
              >
                {t('terms')}
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  )
}
