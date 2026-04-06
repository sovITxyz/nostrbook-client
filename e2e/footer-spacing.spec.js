import { test, expect } from '@playwright/test';

async function loginAndGoToPublicFeed(page) {
  await page.goto('http://localhost:5173/login');
  await page.waitForTimeout(2000);
  await page.getByText('Create New Account').click();
  await page.waitForTimeout(2000);
  const generateBtn = page.getByText(/generate/i);
  if (await generateBtn.isVisible({ timeout: 3000 }).catch(() => false)) { await generateBtn.click(); await page.waitForTimeout(2000); }
  const continueBtn = page.getByRole('button').filter({ hasText: /continue|next|saved|skip|confirm|backup/i }).first();
  if (await continueBtn.isVisible({ timeout: 3000 }).catch(() => false)) { await continueBtn.click(); await page.waitForTimeout(2000); }
  const skipBtn = page.getByRole('button').filter({ hasText: /skip|continue|next|later/i }).first();
  if (await skipBtn.isVisible({ timeout: 3000 }).catch(() => false)) { await skipBtn.click(); await page.waitForTimeout(2000); }
  const nameInput = page.locator('input[type="text"], input[name="name"], input[placeholder*="name" i]').first();
  if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) { await nameInput.fill('TestUser' + Math.floor(Math.random() * 10000)); await page.waitForTimeout(500); }
  const enterBtn = page.getByRole('button').filter({ hasText: /enter.*dashboard|finish|create|submit|join|complete/i }).first();
  if (await enterBtn.isVisible({ timeout: 3000 }).catch(() => false)) { await enterBtn.click(); await page.waitForTimeout(5000); }
  if (!page.url().includes('/feed')) { await page.goto('http://localhost:5173/feed'); await page.waitForTimeout(3000); }
  const publicTab = page.getByText('Public nostr');
  if (await publicTab.isVisible({ timeout: 5000 }).catch(() => false)) { await publicTab.click(); await page.waitForTimeout(8000); }
}

test('mobile - flex space-between like Primal', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await loginAndGoToPublicFeed(page);

  const notes = page.locator('.primal-note');
  const count = await notes.count();
  for (let i = 0; i < Math.min(count, 3); i++) {
    const note = notes.nth(i);
    await note.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await note.screenshot({ path: `e2e/screenshots/v4-note-${i}.png` });
  }

  await page.screenshot({ path: 'e2e/screenshots/v4-mobile-feed.png' });
});

test('desktop - unchanged', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loginAndGoToPublicFeed(page);

  const note = page.locator('.primal-note').first();
  if (await note.isVisible({ timeout: 3000 }).catch(() => false)) {
    await note.screenshot({ path: 'e2e/screenshots/v4-note-desktop.png' });
  }
});
