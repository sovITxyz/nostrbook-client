import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: '.',
    timeout: 90_000,
    retries: 0,
    use: {
        browserName: 'chromium',
        headless: true,
        screenshot: 'on',
        trace: 'off',
    },
});
