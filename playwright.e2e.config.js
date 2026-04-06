import { defineConfig } from '@playwright/test';

// Config for dual-instance E2E relay testing against docker-compose.e2e.yml
// Instance A on :8082, Instance B on :8083
export default defineConfig({
    testDir: './e2e',
    testMatch: 'dual-instance-relay.spec.js',
    timeout: 90_000,
    retries: 0,
    workers: 1, // sequential — tests share relay state
    use: {
        browserName: 'chromium',
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
    },
    // No webServer — both instances run via docker-compose.e2e.yml
});
