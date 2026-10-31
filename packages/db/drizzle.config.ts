import { defineConfig } from 'drizzle-kit'

/**
 * Migrations are the single source of truth for the schema (ADR 0003).
 * Never edit tables through the Supabase dashboard or an MCP server.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/umkm_app',
  },
  strict: true,
  verbose: true,
})
