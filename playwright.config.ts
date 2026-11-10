import { defineConfig } from '@playwright/test';

// Extensões só carregam em Chromium. O Firefox é coberto pelo checklist manual (fase 5).
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    trace: 'retain-on-failure',
  },
});
