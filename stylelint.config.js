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
  ignoreFiles: ['coverage/**']
}
