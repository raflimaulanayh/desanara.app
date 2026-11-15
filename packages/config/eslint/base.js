import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * Shared ESLint flat config for every workspace.
 * Import boundaries live here so AI agents and humans get the same guard rails.
 */
export const base = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/drizzle/**',
      '**/.vercel/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
)

/** Frontend apps must never reach the database or server-only auth code. */
export const frontendBoundaries = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@repo/db', '@repo/db/*'],
            message:
              'Frontend apps must not import the database. Call the API through @repo/api-client.',
          },
          {
            group: ['@repo/auth/server'],
            message:
              'Server-only auth config belongs to apps/api. Use @repo/auth/client or @repo/auth/permissions.',
          },
        ],
      },
    ],
  },
}

export default base
