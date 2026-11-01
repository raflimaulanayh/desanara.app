import { Search } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

/** Plain GET form: works before JavaScript loads and on the slowest phones. */
export async function SearchForm({
  action,
  defaultValue,
  placeholder,
  size = 'lg',
  hidden,
}: {
  action: string
  defaultValue?: string
  placeholder: string
  size?: 'lg' | 'md'
  hidden?: Record<string, string | undefined>
}) {
  const t = await getTranslations('home')
  return (
    <form action={action} method="get" role="search" className="flex items-end gap-2">
      {Object.entries(hidden ?? {}).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}
      <label className="min-w-0 flex-1">
        <span className="sr-only">{t('searchLabel')}</span>
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          enterKeyHint="search"
          className={
            size === 'lg'
              ? 'border-nota-ink placeholder:text-muted/80 h-14 w-full border-b-2 bg-transparent px-1 text-xl focus:outline-none focus-visible:border-[var(--accent)]'
              : 'border-nota-ink placeholder:text-muted/80 h-12 w-full border-b-2 bg-transparent px-1 text-lg focus:outline-none focus-visible:border-[var(--accent)]'
          }
        />
      </label>
      <button
        type="submit"
        className={
          (size === 'lg' ? 'h-14 px-6 text-lg ' : 'h-12 px-5 text-base ') +
          'bg-accent text-accent-foreground font-print inline-flex shrink-0 items-center gap-2 font-bold tracking-[0.08em] uppercase transition-colors hover:bg-[var(--accent-hover)]'
        }
      >
        <Search className="size-5" aria-hidden />
        <span className="max-sm:sr-only">{t('searchSubmit')}</span>
      </button>
    </form>
  )
}
