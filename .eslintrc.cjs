module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['airbnb-base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'import/extensions': [
      'error',
      'always',
      {
        ts: 'never'
      }
    ],
    'no-console': 0,
    'no-use-before-define': 'off',
    'no-unused-vars': 'warn',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/prefer-default-export': 0,
    'import/newline-after-import': 0,
    'no-shadow': 1,
    'prefer-const': 1,
    'prefer-spread': 1,
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }]
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts']
      }
    }
  }
}
