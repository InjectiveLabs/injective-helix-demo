module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  // add your custom config here
  // https://stylelint.io/user-guide/configuration
  rules: {
    'declaration-empty-line-before': null,
    'function-name-case': null,
    'property-no-unknown': [
      true,
      { ignoreProperties: ['font-named-instance'] }
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'extends',
          'include',
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'mixin',
          'each',
          'function',
          'for',
          'if',
          'else',
          'return'
        ]
      }
    ],
    'declaration-block-trailing-semicolon': null,
    'no-descending-specificity': null
  }
}
