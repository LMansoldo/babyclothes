import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import sveltePlugin from 'eslint-plugin-svelte';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'build/**', '.svelte-kit/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-restricted-syntax': [
        'warn',
        {
          selector: "Literal[value=/\\d+px/]",
          message: 'Avoid px in JS/TS. Use rem (1rem = 10px with font-size: 62.5% on html).',
        },
      ],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'no-console': 'warn',
    },
  },
  ...sveltePlugin.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['**/*.svelte'],
  })),
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-restricted-syntax': [
        'warn',
        {
          selector: "Literal[value=/\\d+px/]",
          message: 'Avoid px in JS/TS. Use rem (1rem = 10px with font-size: 62.5% on html).',
        },
      ],
      'no-console': 'warn',
    },
  },
  prettierConfig,
];
