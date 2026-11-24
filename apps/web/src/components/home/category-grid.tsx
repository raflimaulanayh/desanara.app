import { Container } from '@repo/ui/components/container'
import { cn } from '@repo/ui/cn'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { categoryIcon } from '@/lib/category-icons'
import { pick } from '@/lib/localize'

interface Category {
  slug: string
  name: string
  nameEn: string | null
  icon: string | null
}

const iconTones = new Map([
  ['utensils', 'bg-sun/25 text-[color:color-mix(in_oklab,var(--sun)_55%,var(--foreground))]'],
  ['cup', 'bg-sprout/25 text-accent'],
  ['scissors', 'bg-wash-strong text-clay'],
  ['shirt', 'bg-clay/15 text-clay'],
  ['sprout', 'bg-leaf/20 text-accent'],
  ['fish', 'bg-accent/12 text-accent'],
])

/** Compact links into the catalogue, using the category names and icons from the API. */
export async function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null
  const [t, locale] = await Promise.all([getTranslations('home'), getLocale()])

  return (
    <section aria-labelledby="category-title" className="pt-7 sm:pt-9">
      <Container>
        <h2 id="category-title" className="section-title">
          {t('categoriesTitle')}
        </h2>
        <ul className="-mx-4 mt-3.5 flex snap-x gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-6 sm:gap-3 sm:px-0">
          {categories.map((category) => {
            const Icon = categoryIcon(category.slug, category.icon)
            const short = `categoryShort.${category.slug}`
            return (
              <li key={category.slug} className="w-[4.6rem] shrink-0 snap-center sm:w-auto">
                <Link
                  href={{ pathname: '/jelajah', query: { category: category.slug } }}
                  className="hover:bg-accent/6 hover:text-accent flex h-full flex-col items-center gap-2 rounded-(--radius) px-1 py-1 text-center text-xs leading-tight font-semibold focus-visible:outline-offset-[-2px] sm:px-2 sm:py-2 sm:text-sm"
                >
                  <span
                    className={cn(
                      'grid size-11 shrink-0 place-items-center rounded-(--radius) sm:size-13',
                      iconTones.get(category.icon ?? '') ?? 'bg-accent/12 text-accent',
                    )}
                  >
                    <Icon className="size-5 sm:size-6" strokeWidth={1.9} aria-hidden />
                  </span>
                  <span className="max-w-full wrap-break-word">
                    {t.has(short) ? t(short) : pick(locale, category.name, category.nameEn)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
