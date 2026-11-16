import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().default(8787),
  API_URL: z.url().default('http://localhost:8787'),
  DATABASE_URL: z.string().min(1),
  /** Connections per API instance. Keep small (1–3) on Vercel behind the Supabase transaction pooler. */
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
  /** Public origin for Better Auth when the API is reached through a proxy (the dashboard). Defaults to API_URL. */
  AUTH_BASE_URL: z
    .string()
    .optional()
    .transform((v) => v || undefined)
    .pipe(z.url().optional()),
  BETTER_AUTH_SECRET: z.string().min(16),
  TRUSTED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3001')
    .transform((v) =>
      v
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    ),
  /** Login for /docs and /openapi.json. Without DOCS_PASSWORD, production serves no API reference at all. */
  DOCS_USERNAME: z.string().min(1).default('desanara'),
  DOCS_PASSWORD: z
    .string()
    .optional()
    .transform((v) => v || undefined)
    .pipe(z.string().min(12).optional()),
  /** Cloudflare R2 (docs/architecture/storage.md). Without all four, upload endpoints answer 503. */
  R2_ACCOUNT_ID: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  R2_ACCESS_KEY_ID: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  R2_SECRET_ACCESS_KEY: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  R2_BUCKET: z.string().default('desanara-media'),
  COOKIE_DOMAIN: z
    .string()
    .optional()
    .transform((v) => v || undefined),
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = envSchema.safeParse(source)
  if (!parsed.success) {
    console.error('Invalid environment variables:', z.prettifyError(parsed.error))
    throw new Error('Invalid environment variables (see .env.example)')
  }
  return parsed.data
}
