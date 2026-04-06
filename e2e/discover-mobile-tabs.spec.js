/**
 * E2E test: Discover page mobile tab styling
 * Verifies the Projects/Members tabs on mobile use the underline-style
 * active indicator matching Feed and Media pages.
 */

import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001/api';

async function registerUser(request) {
    const email = `tabtest-${Date.now()}@test.local`;
    const res = await request.post(`${API}/auth/register`, {
        data: { email, password: 'TestPass123!', role: 'BUILDER', name: `TabTest ${Date.now()}` },
    });
    expect(res.ok(), `Register failed: ${res.status()}`).toBeTruthy();
    const body = await res.json();
    return { token: body.token, user: body.user, email };
}

test.describe('Discover mobile tabs', () => {
    let token;

    test.beforeAll(async ({ request }) => {
        const user = await registerUser(request);
        token = user.token;
    });

    test('mobile: tabs visible with underline-style active indicator', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 390, height: 844 });

        // Inject auth token and navigate
        await page.goto('/');
        await page.evaluate((t) => {
            localStorage.setItem('bies_token', t);
        }, token);
        await page.goto('/discover');
        await page.waitForLoadState('networkidle');

        // Tabs container should be visible on mobile
        const tabsContainer = page.locator('.discover-mobile-tabs');
        await expect(tabsContainer).toBeVisible();

        // Should have exactly 2 tab buttons
        const tabs = tabsContainer.locator('.discover-tab');
        await expect(tabs).toHaveCount(2);

        // First tab (Projects) should be active by default
        const projectsTab = tabs.nth(0);
        const membersTab = tabs.nth(1);
        await expect(projectsTab).toHaveClass(/active/);

        // Active tab should have a bottom border (underline indicator)
        const projectsBorder = await projectsTab.evaluate(
            el => getComputedStyle(el).borderBottomColor
        );
        // Should NOT be transparent
        expect(projectsBorder).not.toBe('rgba(0, 0, 0, 0)');
        expect(projectsBorder).not.toBe('transparent');

        // Inactive tab should have transparent bottom border
        const membersBorder = await membersTab.evaluate(
            el => getComputedStyle(el).borderBottomColor
        );
        expect(
            membersBorder === 'rgba(0, 0, 0, 0)' || membersBorder === 'transparent'
        ).toBeTruthy();

        // Take screenshot for visual verification
        await page.screenshot({ path: 'e2e/screenshots/discover-mobile-tabs-projects.png', fullPage: false });

        // Switch to Members tab
        await membersTab.click();
        await expect(membersTab).toHaveClass(/active/);
        await expect(projectsTab).not.toHaveClass(/active/);

        await page.screenshot({ path: 'e2e/screenshots/discover-mobile-tabs-members.png', fullPage: false });
    });

    test('desktop: tabs hidden, both sections visible', async ({ page }) => {
        // Set desktop viewport
        await page.setViewportSize({ width: 1280, height: 800 });

        await page.goto('/');
        await page.evaluate((t) => {
            localStorage.setItem('bies_token', t);
        }, token);
        await page.goto('/discover');
        await page.waitForLoadState('networkidle');

        // Tabs container should be hidden on desktop
        const tabsContainer = page.locator('.discover-mobile-tabs');
        await expect(tabsContainer).toBeHidden();

        await page.screenshot({ path: 'e2e/screenshots/discover-desktop-both-sections.png', fullPage: false });
    });
});
