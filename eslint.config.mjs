import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/node_modules/', '**/miniprogram_npm/', '**/cloudfunctions/', 'web/dist/'],
  },
  // JS files (scripts/seed.js etc.)
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
    },
  },
  // TS files (miniprogram + scripts + web)
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  // miniprogram-specific globals
  {
    files: ['miniprogram/**/*.ts'],
    languageOptions: {
      globals: {
        wx: 'readonly',
        App: 'readonly',
        Page: 'readonly',
        Component: 'readonly',
        getApp: 'readonly',
        getCurrentPages: 'readonly',
        console: 'readonly',
      },
    },
  },
  // scripts-specific globals
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
  },
  // Shared TS rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
  eslintPluginPrettier,
];
