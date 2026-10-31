import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  const [shared, app] = await Promise.all([
    import(`@repo/i18n/messages/${locale}.json`),
    import(`../../messages/${locale}.json`),
  ])

  return { locale, messages: { ...shared.default, ...app.default } }
})
