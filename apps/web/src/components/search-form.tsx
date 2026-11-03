import { Search } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { cn } from '@repo/ui/cn'

/** Plain GET form: works before JavaScript loads and on the slowest phones. */
export async function SearchForm({
  action,
  defaultValue,
  placeholder,
  size = 'md',
  hidden,
  className,
}: {
  action: string
  defaultValue?: string
  placeholder: string
  size?: 'lg' | 'md'
  hidden?: Record<string, string | undefined>
  className?: string
}) {
  const t = await getTranslations('home')
  return (
    <form
      action={action}
      method="get"
      role="search"
      className={cn(
        'border-line-strong bg-surface focus-within:border-accent flex items-center gap-1 rounded-full border pl-4 shadow-sm',
        size === 'lg' ? 'h-14' : 'h-11',
        className,
      )}
    >
      {Object.entries(hidden ?? {}).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}
      <Search className="text-muted size-5 shrink-0" aria-hidden />
      <label className="min-w-0 flex-1">
        <span className="sr-only">{t('searchLabel')}</span>
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          enterKeyHint="search"
          className={cn(
            'placeholder:text-muted/80 w-full bg-transparent px-2 focus:outline-none',
            size === 'lg' ? 'h-12 text-base sm:text-lg' : 'h-10 text-base',
          )}
        />
      </label>
      <button
        type="submit"
        className={cn(
          'bg-accent text-accent-foreground mr-1 inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition-colors hover:bg-[var(--accent-hover)]',
          size === 'lg' ? 'h-11 px-6 text-base' : 'h-9 px-4 text-sm',
        )}
      >
        {t('searchSubmit')}
      </button>
    </form>
  )
}
