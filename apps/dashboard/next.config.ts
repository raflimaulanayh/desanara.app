import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@repo/ui',
    '@repo/i18n',
    '@repo/api-client',
    '@repo/auth',
    '@repo/validators',
  ],
}

// Dashboard is Indonesian-first; strings still go through next-intl so EN can be added later.
export default createNextIntlPlugin('./src/i18n.ts')(nextConfig)
