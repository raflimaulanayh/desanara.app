import { Container } from '@repo/ui/components/container'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { mediaUrl } from '@/lib/media'
import { readPhotoCredits } from '@/lib/photo-credits'
import { pageAlternates } from '@/lib/site-url'

/** Built once at deploy: the credits come from files in /public, which functions cannot read. */
export const dynamic = 'force-static'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'credits' })
  return {
    title: t('title'),
    robots: { index: false },
    alternates: pageAlternates('/tentang/kredit-foto', locale),
  }
}

export default async function PhotoCreditsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, credits] = await Promise.all([getTranslations('credits'), readPhotoCredits()])
  return (
    <Container className="py-10 sm:py-14">
      <h1 className="page-title">{t('title')}</h1>
      <p className="text-muted mt-4 max-w-[66ch] text-base leading-relaxed">{t('lead')}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {credits.map((c) => {
          const src = mediaUrl(c.key)
          return (
            <li key={c.key} className="border-line flex gap-3 rounded-(--radius) border p-3">
              <div className="bg-wash relative size-16 shrink-0 overflow-hidden rounded-(--radius-compact)">
                {src ? <Image src={src} alt="" fill sizes="64px" className="object-cover" /> : null}
              </div>
              <div className="min-w-0 text-sm">
                <p className="line-clamp-2 font-semibold">{c.title}</p>
                <p className="text-muted mt-0.5">
                  {c.author ? t('by', { author: c.author }) : t('unknownAuthor')}
                  {' · '}
                  {c.licenseUrl ? (
                    <a
                      href={c.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer license"
                      className="hover:text-accent underline underline-offset-2"
                    >
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                </p>
                {c.source ? (
                  <a
                    href={c.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent mt-1 inline-flex items-center gap-1 font-medium hover:underline"
                  >
                    {t('source')}
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-muted mt-8 max-w-[66ch] text-sm">{t('changes')}</p>
    </Container>
  )
}
