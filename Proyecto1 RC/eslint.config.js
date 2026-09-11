const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    files: ['jest.setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
      },
    },
  },
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
]);
