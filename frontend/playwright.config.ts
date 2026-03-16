import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  tsconfig: './e2e/tsconfig.json',
  timeout: 30000,
  retries: 1,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
