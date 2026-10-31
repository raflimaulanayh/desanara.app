import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().default(8787),
  API_URL: z.url().default('http://localhost:8787'),
  DATABASE_URL: z.string().min(1),
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
