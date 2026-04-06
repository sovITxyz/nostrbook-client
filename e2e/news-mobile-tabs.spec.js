/**
 * E2E test: News page mobile tab styling
 * Verifies the News/Twitter tabs on mobile use the underline-style active indicator.
 */

import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001/api';

async function registerUser(request) {
    const email = `newstest-${Date.now()}@test.local`;
    const res = await request.post(`${API}/auth/register`, {
        data: { email, password: 'TestPass123!', role: 'BUILDER', name: `NewsTest ${Date.now()}` },
    });
    expect(res.ok(), `Register failed: ${res.status()}`).toBeTruthy();
    const body = await res.json();
    return { token: body.token, user: body.user, email };
}

test.describe('News mobile tabs', () => {
    let token;

    test.beforeAll(async ({ request }) => {
        const user = await registerUser(request);
        token = user.token;
    });

    test('mobile: tabs visible with underline-style active indicator', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });

        await page.goto('/');
        await page.evaluate((t) => {
            localStorage.setItem('bies_token', t);
        }, token);
        await page.goto('/news');
        await page.waitForLoadState('networkidle');

        const tabsContainer = page.locator('.mobile-feed-tabs');
        await expect(tabsContainer).toBeVisible();

        const tabs = tabsContainer.locator('.feed-tab');
        await expect(tabs).toHaveCount(2);

        // First tab (News) should be active by default
        const newsTab = tabs.nth(0);
        const twitterTab = tabs.nth(1);
        await expect(newsTab).toHaveClass(/active/);

        // Active tab should have a non-transparent bottom border
        const newsBorder = await newsTab.evaluate(
            el => getComputedStyle(el).borderBottomColor
        );
        expect(newsBorder).not.toBe('rgba(0, 0, 0, 0)');
        expect(newsBorder).not.toBe('transparent');

        // Inactive tab should have transparent bottom border
        const twitterBorder = await twitterTab.evaluate(
            el => getComputedStyle(el).borderBottomColor
        );
        expect(
            twitterBorder === 'rgba(0, 0, 0, 0)' || twitterBorder === 'transparent'
        ).toBeTruthy();

        await page.screenshot({ path: 'e2e/screenshots/news-mobile-tabs-news.png', fullPage: false });

        // Switch to Twitter tab
        await twitterTab.click();
        await expect(twitterTab).toHaveClass(/active/);
        await expect(newsTab).not.toHaveClass(/active/);

        await page.screenshot({ path: 'e2e/screenshots/news-mobile-tabs-twitter.png', fullPage: false });
    });

    test('desktop: tabs hidden', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });

        await page.goto('/');
        await page.evaluate((t) => {
            localStorage.setItem('bies_token', t);
        }, token);
        await page.goto('/news');
        await page.waitForLoadState('networkidle');

        const tabsContainer = page.locator('.mobile-feed-tabs');
        await expect(tabsContainer).toBeHidden();
    });
});
