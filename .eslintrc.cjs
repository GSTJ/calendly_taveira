module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],

  env: {
    jest: true,
  },

  rules: {
    'no-console': 'warn',
    'prettier/prettier': 'error',
    '@typescript-eslint/no-empty-function': 'off',
    'no-plusplus': 'warn',
    'import/no-duplicates': 'error',
    'simple-import-sort/imports': ['error'],
    'simple-import-sort/exports': 'error',
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'no-undef': 'off',
  },

  plugins: ['prettier', 'simple-import-sort', 'unused-imports', 'import'],
};
