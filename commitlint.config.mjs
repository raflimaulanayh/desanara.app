/**
 * Conventional Commits, enforced by the husky commit-msg hook.
 *   <type>(<optional scope>): <subject>
 *   feat(api): add product search endpoint
 * Types: feat, fix, chore, docs, refactor, test, style, perf, build, ci, revert.
 * Scopes (optional): web, dashboard, api, db, auth, ui, i18n, validators, api-client, config, docs, deps, release.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'web',
        'dashboard',
        'api',
        'db',
        'auth',
        'ui',
        'i18n',
        'validators',
        'api-client',
        'config',
        'docs',
        'deps',
        'release',
        'theme',
      ],
    ],
    'subject-case': [0],
    'body-max-line-length': [1, 'always', 120],
  },
}
