module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  plugins: ['svelte3', 'prettier'],
  extends: ['standard', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  rules: {},
};
