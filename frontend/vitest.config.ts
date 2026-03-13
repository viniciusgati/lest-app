import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['./vitest-minimal-reporter.js']
  }
});
