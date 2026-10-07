import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', workers: 1, use: { baseURL: 'http://127.0.0.1:4200', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'node node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1', url: 'http://127.0.0.1:4200', reuseExistingServer: !process.env['CI'], timeout: 120000 }
});
