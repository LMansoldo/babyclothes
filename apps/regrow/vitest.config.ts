import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  resolve: {
    conditions: ['browser'],
    alias: {
      $lib: resolve(__dirname, './src/lib'),
      '$app/stores': resolve(__dirname, './src/mocks/stores.ts'),
      '$app/forms': resolve(__dirname, './src/mocks/forms.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    include: ['src/**/*.test.ts'],
  },
});
