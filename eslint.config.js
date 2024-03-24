import antfu from '@antfu/eslint-config'

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single',
      jsx: false,
      semi: false,
    },
    formatters: { markdown: 'dprint' },

    typescript: true,
    test: true,
    jsonc: true,
    yaml: true,
    markdown: true,
    vue: true,
    jsx: true,

    gitignore: false,
    toml: false,
    unocss: false,
    react: false,
    svelte: false,

    ignores: [
      'backend/src/services/database/generated-prisma-client/**',
    ],
  },
  {
    rules: {
      'style/brace-style': ['error', '1tbs'],
      'style/quote-props': ['error', 'consistent-as-needed'],
      'object-shorthand': ['error', 'consistent-as-needed'],
      'curly': ['error', 'all'],

      'no-console': 'warn',

      'ts/consistent-type-definitions': 'off',
      'ts/no-redeclare': 'off',
    },
  },
)
