// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single',
      jsx: true,
      semi: false,
    },

    typescript: true,
    jsx: true,
    test: true,
    yaml: true,
    markdown: true,
    jsonc: true,
    gitignore: true,

    formatters: {
      markdown: 'dprint',
    },

    ignores: [
      'backend/src/services/database/generated-prisma-client/**',
      'backend/src/services/database/migrations/**',
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
