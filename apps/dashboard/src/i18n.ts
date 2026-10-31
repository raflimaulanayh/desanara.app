import { defaultLocale } from '@repo/i18n'
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  const locale = defaultLocale
  const [shared, app] = await Promise.all([
    import(`@repo/i18n/messages/${locale}.json`),
    import(`../messages/${locale}.json`),
  ])
  return { locale, messages: { ...shared.default, ...app.default } }
})
