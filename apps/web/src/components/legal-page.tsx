import { Container } from '@repo/ui/components/container'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { HIMASIF_INSTAGRAM } from '@/lib/paths'
import { InstagramIcon } from './instagram-icon'

interface LegalSection {
  id: string
  title: string
  body?: string[]
  items?: string[]
  /** Paragraphs after the list. */
  note?: string[]
}

/** Renders `<hl>…</hl>` in legal copy as the sun highlighter stroke used across the public site. */
function withMarks(text: string): ReactNode[] {
  return text.split(/(<hl>.*?<\/hl>)/).map((part, i) =>
    part.startsWith('<hl>') ? (
      <span key={i} className="about-mark text-foreground font-semibold">
        {part.slice(4, -5)}
      </span>
    ) : (
      part
    ),
  )
}

/**
 * Shared layout for the privacy policy and the terms (PLAN-registration-email): title, effective date and
 * plain-language sections from messages (`legal.<kind>.sections`), a sticky table of contents on wide
 * screens, and a contact box. Reading layout: one measured column, no motion.
 */
export async function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const t = await getTranslations('legal')
  const sections = t.raw(`${kind}.sections`) as LegalSection[]

  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-[44rem]">
        <h1 className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.03em] sm:text-5xl">
          {t(`${kind}.title`)}
        </h1>
        <p className="bg-accent-soft text-accent-soft-foreground mt-4 inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold">
          {t('updated')}
        </p>
        <p className="text-foreground/80 mt-5 text-lg leading-relaxed text-pretty">
          {t(`${kind}.intro`)}
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[14rem_minmax(0,44rem)] lg:gap-16">
        <nav aria-label={t('contents')} className="hidden lg:block">
          <div className="sticky top-28">
            <p className="text-muted text-xs font-semibold">{t('contents')}</p>
            <ol className="mt-3 flex flex-col gap-1 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-foreground/70 hover:text-accent block py-1.5 leading-snug transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-32 lg:scroll-mt-28">
              <h2 className="text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
                {section.title}
              </h2>
              {section.body?.map((paragraph, i) => (
                <p key={i} className="text-foreground/80 mt-3 leading-relaxed text-pretty">
                  {withMarks(paragraph)}
                </p>
              ))}
              {section.items ? (
                <ul className="mt-4 flex flex-col gap-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-foreground/80 flex gap-3 leading-relaxed">
                      <span
                        aria-hidden
                        className="bg-accent mt-2.5 size-1.5 shrink-0 rounded-full"
                      />
                      <span className="text-pretty">{withMarks(item)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.note?.map((paragraph, i) => (
                <p key={i} className="text-foreground/80 mt-4 leading-relaxed text-pretty">
                  {withMarks(paragraph)}
                </p>
              ))}
            </section>
          ))}

          <div className="bg-wash/50 border-line rounded-(--radius) border p-6 sm:p-8">
            <p className="text-lg font-semibold">{t('contactTitle')}</p>
            <p className="text-foreground/75 mt-1.5 leading-relaxed">{t('contactBody')}</p>
            <a
              href={HIMASIF_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent text-accent-foreground mt-5 inline-flex min-h-12 items-center gap-2 rounded-full px-6 font-semibold transition-colors hover:bg-[var(--accent-hover)]"
            >
              <InstagramIcon className="size-5" />
              {t('contactCta')}
            </a>
          </div>
        </div>
      </div>
    </Container>
  )
}
