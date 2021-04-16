module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    'jest/globals': true
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  extends: [
    'standard',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:vue/recommended',
    'prettier'
  ],
  plugins: ['jest', 'vue', '@typescript-eslint', 'prettier'],
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.ts', '.mjs'] }
    }
  },
  rules: {
    /**********************/
    /* General Code Rules */
    /**********************/

    // Enforce import order
    'import/order': 'error',

    // Imports should come first
    'import/first': 'error',

    // Other import rules
    'import/no-mutable-exports': 'error',

    // Allow unresolved imports
    'import/no-unresolved': 'off',

    // Allow paren-less arrow functions only when there's no braces
    'arrow-parens': 'off',

    // Allow async-await
    'generator-star-spacing': 'off',

    // Allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-console': 'warn',

    // Prefer const over let
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false
      }
    ],

    // No single if in an "else" block
    'no-lonely-if': 'error',

    // Force curly braces for control flow,
    // including if blocks with a single statement
    curly: ['error', 'all'],

    // No async function without await
    'require-await': 'error',

    // Force dot notation when possible
    'dot-notation': 'error',

    'no-var': 'error',

    // Force object shorthand where possible
    'object-shorthand': 'error',

    // No useless destructuring/importing/exporting renames
    'no-useless-rename': 'error',

    /**********************/
    /*     Vue Rules      */
    /**********************/

    // Disable template errors regarding invalid end tags
    'vue/no-parsing-error': [
      'error',
      {
        'x-invalid-end-tag': false
      }
    ],

    // Vue component is off
    'vue/require-component-is': 'off',

    /** Custom Codes */
    '@typescript-eslint/no-unused-vars': [
      'error',
      { args: 'all', argsIgnorePattern: '^_' }
    ],
    'comma-dangle': ['error', 'never'],
    'linebreak-style': 'off'
  }
}
