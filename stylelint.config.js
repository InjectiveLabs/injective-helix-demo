module.exports = {
  extends: ['stylelint-config-recommended'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'apply',
          'layer',
          'responsive',
          'screen',
          'tailwind',
          'variants'
        ]
      }
    ],
    'declaration-property-value-no-unknown': null,
    'function-no-unknown': [true, { ignoreFunctions: ['theme'] }]
  },
  overrides: [
    {
      files: ['**/**/*.vue'],
      customSyntax: 'postcss-html'
    },
    {
      files: ['**/**/*.css'],
      customSyntax: 'postcss'
    }
  ],
  ignoreFiles: ['coverage/**', 'dist/**', '.nuxt/**', '.output/**']
}
