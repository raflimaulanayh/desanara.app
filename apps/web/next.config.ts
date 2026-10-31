import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/i18n', '@repo/api-client'],
  typedRoutes: false,
}

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig)
