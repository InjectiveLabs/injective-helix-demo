import withNuxt from './.nuxt/eslint.config.mjs'
import perfectionist from 'eslint-plugin-perfectionist'

const sortGroups = {
  groups: [
    [
      'builtin',
      'internal',
      'external',
      'injective',
      'shared',
      'parent',
      'sibling',
      'index',
      'object'
    ],
    ['root', 'unknown'],
    'types',
    'type',
    'internal-type',
    ['parent-type', 'sibling-type', 'index-type']
  ] as string[] | { newlinesBetween: 'always' }[],

  customGroups: {
    value: {
      shared: '^@shared/',
      injective: '^@injectivelabs/',
      types: ['^@/types', '^@/types/*'],
      root: [
        '^@/app/',
        '^@/store/',
        '^@/utils/',
        '^@/plugins/',
        '^@/assets/',
        '^@/components/',
        '^@/layouts/',
        '^@/pages/',
        '^@/public/',
        '^@/server/',
        '^@/store/'
      ]
    }
  }
}

const orderParams = {
  order: 'asc',
  type: 'line-length'
} as const

export default withNuxt({
  ignores: ['i18n/locales/**'],

  plugins: {
    perfectionist
  },

  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'vue/html-self-closing': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    ...perfectionist.configs['recommended-line-length'].rules,

    'perfectionist/sort-enums': ['warn', orderParams],
    'perfectionist/sort-objects': ['warn', orderParams],
    'perfectionist/sort-exports': ['warn', orderParams],
    'perfectionist/sort-modules': ['warn', orderParams],
    'perfectionist/sort-interfaces': ['warn', orderParams],
    'perfectionist/sort-union-types': ['warn', orderParams],
    'perfectionist/sort-object-types': ['warn', orderParams],
    'perfectionist/sort-named-exports': ['warn', orderParams],
    'perfectionist/sort-named-imports': ['warn', orderParams],
    'perfectionist/sort-array-includes': ['warn', orderParams],
    'perfectionist/sort-imports': [
      'warn',
      {
        ...orderParams,
        newlinesBetween: 'never',
        groups: sortGroups.groups,
        customGroups: sortGroups.customGroups
      }
    ]
  }
})
