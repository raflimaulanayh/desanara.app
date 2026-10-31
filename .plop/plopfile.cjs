/** `bun run generate` — scaffolds following docs/architecture/structure.md. */
module.exports = function (plop) {
  plop.setGenerator('api-module', {
    description:
      'API module in apps/api/src/modules/<name> (routes, service, repository, schema, test)',
    prompts: [
      { type: 'input', name: 'name', message: 'Module name (plural, kebab-case, e.g. products):' },
    ],
    actions: [
      ...['routes', 'service', 'repository', 'schema', 'test'].map((part) => ({
        type: 'add',
        path: `../apps/api/src/modules/{{kebabCase name}}/{{kebabCase name}}.${part}.ts`,
        templateFile: `templates/api-module/${part}.ts.hbs`,
      })),
      () =>
        'Next: mount it in apps/api/src/app.ts by extending the route chain, add permissions/tests, and update docs/CHANGELOG.md.',
    ],
  })
}
