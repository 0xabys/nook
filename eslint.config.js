// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    // File sinh tự động, đừng bắt nó theo style của repo.
    ignores: ['dist/*', 'android/*', 'ios/*', '.expo/*', 'expo-env.d.ts', 'nativewind-env.d.ts'],
  },
  {
    rules: {
      // Import trùng module dễ lọt khi tách screen/component.
      'import/no-duplicates': 'error',
      // Domain sức khỏe tâm thần: không log nội dung audio / lựa chọn của user.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Script Node chạy ở terminal, console.log là output chính đáng.
    files: ['scripts/**/*.js'],
    rules: { 'no-console': 'off' },
  },
  {
    // Plugin @typescript-eslint chỉ được nạp cho file TS trong eslint-config-expo.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
]);
