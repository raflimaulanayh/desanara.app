import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

/**
 * When API_PROXY_TARGET is set (Vercel, ADR 0009), the dashboard serves the API on its own origin:
 * /api/auth/* and /v1/* are rewritten to the API project. The Better Auth session cookie is then
 * first-party on the dashboard host, so login works on *.vercel.app without a shared domain.
 * Locally it is unset and the browser calls NEXT_PUBLIC_API_URL (http://localhost:8787) directly.
 */
const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, '')

const nextConfig: NextConfig = {
  transpilePackages: [
    '@repo/ui',
    '@repo/i18n',
    '@repo/api-client',
    '@repo/auth',
    '@repo/validators',
  ],
  rewrites: async () =>
    apiProxyTarget
      ? [
          { source: '/api/auth/:path*', destination: `${apiProxyTarget}/api/auth/:path*` },
          { source: '/v1/:path*', destination: `${apiProxyTarget}/v1/:path*` },
        ]
      : [],
}

// Dashboard is Indonesian-first; strings still go through next-intl so EN can be added later.
export default createNextIntlPlugin('./src/i18n.ts')(nextConfig)
