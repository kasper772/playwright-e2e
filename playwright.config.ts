import { defineConfig, devices } from '@playwright/test';
import { AUTH_FILE } from './src/data/paths';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Logs in once and saves the session, so UI tests start already signed in.
    {
      name: 'setup',
      testMatch: /setup\/.*\.setup\.ts/,
      use: { baseURL: 'https://www.saucedemo.com' },
    },
    ...(['chromium', 'firefox', 'webkit'] as const).map((browser) => ({
      name: browser,
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices[{ chromium: 'Desktop Chrome', firefox: 'Desktop Firefox', webkit: 'Desktop Safari' }[browser]],
        baseURL: 'https://www.saucedemo.com',
        storageState: AUTH_FILE,
      },
    })),
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: 'https://restful-booker.herokuapp.com' },
    },
  ],
});
