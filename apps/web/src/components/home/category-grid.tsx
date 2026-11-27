import { Container } from '@repo/ui/components/container'
import { LoadingRegion, SkeletonBlock } from '@repo/ui/components/loading-region'
import { cn } from '@repo/ui/cn'
import { ArrowUpRight } from 'lucide-react'
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

const categoriesLayout =
  '-mx-4 mt-3.5 flex snap-x gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-4 sm:grid sm:grid-cols-3 sm:gap-3 sm:px-0 lg:grid-cols-6'
const itemLayout = 'w-[4.6rem] shrink-0 snap-center sm:w-auto'
// Phones: a compact swipeable row. Wider: bordered cards with the icon above a left-aligned name.
const categoryLayout =
  'flex h-full flex-col items-center gap-2 rounded-(--radius) px-1 py-1 text-center text-xs leading-tight font-semibold sm:relative sm:items-start sm:gap-4 sm:border sm:border-line sm:bg-surface sm:p-4 sm:text-left sm:text-sm'

export function CategoryGridSkeleton({ title, label }: { title: string; label: string }) {
  return (
    <Container className="pt-7 sm:pt-9">
      <h2 className="section-title">{title}</h2>
      <LoadingRegion label={label}>
        <ul className={categoriesLayout}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <li key={index} className={itemLayout}>
              <div className={categoryLayout}>
                <SkeletonBlock className="size-11 rounded-(--radius) sm:size-13" />
                <SkeletonBlock className="h-[0.9375rem] w-10 sm:h-[1.09375rem]" />
              </div>
            </li>
          ))}
        </ul>
      </LoadingRegion>
    </Container>
  )
}

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
        <ul className={categoriesLayout}>
          {categories.map((category) => {
            const Icon = categoryIcon(category.slug, category.icon)
            const short = `categoryShort.${category.slug}`
            return (
              <li key={category.slug} className={itemLayout}>
                <Link
                  href={{ pathname: '/jelajah', query: { category: category.slug } }}
                  className={cn(
                    categoryLayout,
                    'group hover:bg-accent/6 hover:text-accent sm:hover:border-accent sm:hover:bg-accent-soft sm:hover:text-accent-soft-foreground transition-colors focus-visible:outline-offset-[-2px]',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-11 shrink-0 place-items-center rounded-(--radius) sm:size-13',
                      iconTones.get(category.icon ?? '') ?? 'bg-accent/12 text-accent',
                    )}
                  >
                    <Icon className="size-5 sm:size-6" strokeWidth={1.9} aria-hidden />
                  </span>
                  <ArrowUpRight
                    className="text-accent absolute top-3.5 right-3.5 hidden size-4 opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                    aria-hidden
                  />
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
