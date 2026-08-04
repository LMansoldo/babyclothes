import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev',
    port: 5180,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:5180',
    locale: 'pt-BR',
  },
});
