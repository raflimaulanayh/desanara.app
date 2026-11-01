import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/i18n', '@repo/api-client', '@repo/validators'],
  typedRoutes: false,
}

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig)
