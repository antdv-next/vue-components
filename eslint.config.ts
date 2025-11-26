import antfu from '@antfu/eslint-config'

export default antfu(
  {
    regexp: false,
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.vue',
    ],
    rules: {
      'no-prototype-builtins': 0,
      'eslint-comments/no-unlimited-disable': 0,
      'node/prefer-global/process': 0,
      'unicorn/prefer-number-properties': 0,
      'no-console': 0,
      'ts/no-unsafe-function-type': 0,
      'unused-imports/no-unused-vars': 0,
      'jsdoc/empty-tags': 0,
      'no-template-curly-in-string': 0,
    },
  },
  {
    ignores: [
      'packages/qrcode/src/libs',
    ],
  },
)
