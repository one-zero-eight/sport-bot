import antfu from '@antfu/eslint-config'

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single',
      jsx: true,
      semi: false,
    },

    formatters: { markdown: 'dprint' },

    typescript: true,
    jsx: true,
    test: true,

    yaml: true,
    markdown: true,
    jsonc: true,
    toml: false,
    gitignore: false,

    vue: false,
    react: false,
    svelte: false,

    unocss: false,

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
