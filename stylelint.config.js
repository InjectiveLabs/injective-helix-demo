module.exports = {
  extends: '@injectivelabs/stylelint-config',
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
  rules: {
    'at-rule-no-unknown': null,
    'no-duplicate-selectors': null
  },
  ignoreFiles: ['coverage/**']
}
