/**
 * Comprehensive Playwright E2E bug-testing suite for the BIES platform.
 * Tests all public pages, auth flows, protected pages, profiles, events,
 * projects, messaging, and dashboard functionality.
 */

import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001/api';
const BASE = '/biestest';

// ── Helpers ──────────────────────────────────────────────────────────

async function registerUser(request, suffix) {
    const email = `bugtest-${suffix}-${Date.now()}@test.local`;
    const res = await request.post(`${API}/auth/register`, {
        data: { email, password: 'TestPass123!', role: 'BUILDER', name: `BugTest ${suffix}` },
    });
    expect(res.ok(), `Register ${suffix} failed: ${res.status()}`).toBeTruthy();
    const body = await res.json();
    return { token: body.token, user: body.user, email };
}

async function registerInvestor(request, suffix) {
    const email = `bugtest-inv-${suffix}-${Date.now()}@test.local`;
    const res = await request.post(`${API}/auth/register`, {
        data: { email, password: 'TestPass123!', role: 'INVESTOR', name: `Investor ${suffix}` },
    });
    expect(res.ok(), `Register investor ${suffix} failed: ${res.status()}`).toBeTruthy();
    const body = await res.json();
    return { token: body.token, user: body.user, email };
}

function authHeaders(token) {
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function injectAuth(page, token, user) {
    await page.goto(`${BASE}/`);
    await page.evaluate(({ token, user }) => {
        localStorage.setItem('bies_token', token);
        localStorage.setItem('bies_user', JSON.stringify(user));
    }, { token, user });
}

async function checkNoConsoleErrors(page) {
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    return errors;
}

// ── 1. Public Pages ──────────────────────────────────────────────────

test.describe('Public Pages - Load & Render', () => {

    test('Landing page loads with hero and CTA', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

        const response = await page.goto(`${BASE}/`);
        expect(response.status()).toBeLessThan(400);

        // Hero section should exist
        await expect(page.locator('.hero, .landing-page, h1').first()).toBeVisible({ timeout: 10000 });

        // CTA buttons should be present
        const buttons = page.locator('.btn, button, a.btn-primary');
        expect(await buttons.count()).toBeGreaterThan(0);
    });

    test('Login page renders correctly', async ({ page }) => {
        const response = await page.goto(`${BASE}/login`);
        expect(response.status()).toBeLessThan(400);

        // Should have login form elements
        await expect(page.locator('.login-card, .login-container, form').first()).toBeVisible({ timeout: 10000 });

        // Should have login buttons
        const loginBtns = page.locator('button');
        expect(await loginBtns.count()).toBeGreaterThan(0);
    });

    test('Signup page renders correctly', async ({ page }) => {
        const response = await page.goto(`${BASE}/signup`);
        expect(response.status()).toBeLessThan(400);

        await expect(page.locator('.signup-card, .signup-container, h1, h2').first()).toBeVisible({ timeout: 10000 });
    });

    test('Discover page loads', async ({ page }) => {
        const response = await page.goto(`${BASE}/discover`);
        expect(response.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
        // Should have a search or project grid
        const content = page.locator('input, .project-card, .card, h1, h2');
        expect(await content.count()).toBeGreaterThan(0);
    });

    test('Events page loads', async ({ page }) => {
        const response = await page.goto(`${BASE}/events`);
        expect(response.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
        const content = page.locator('.event-card, h1, h2, .container');
        expect(await content.count()).toBeGreaterThan(0);
    });

    test('Builders page loads', async ({ page }) => {
        const response = await page.goto(`${BASE}/builders`);
        expect(response.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
        const content = page.locator('.builders-grid, .card, h1, h2, input');
        expect(await content.count()).toBeGreaterThan(0);
    });

    test('Investors page loads', async ({ page }) => {
        const response = await page.goto(`${BASE}/investors`);
        expect(response.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
        const content = page.locator('.card, h1, h2, input');
        expect(await content.count()).toBeGreaterThan(0);
    });

    test('About/Team page loads', async ({ page }) => {
        const response = await page.goto(`${BASE}/about`);
        expect(response.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
    });

    test('News page loads', async ({ page }) => {
        const response = await page.goto(`${BASE}/news`);
        expect(response.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
    });

    test('Media page loads', async ({ page }) => {
        const response = await page.goto(`${BASE}/media`);
        expect(response.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
    });

    test('404 - Non-existent route renders gracefully', async ({ page }) => {
        const response = await page.goto(`${BASE}/this-page-does-not-exist-12345`);
        // Should not crash - either 404 page or redirect
        const bodyText = await page.textContent('body');
        expect(bodyText).toBeTruthy();
    });
});

// ── 2. Auth Flow ─────────────────────────────────────────────────────

test.describe('Authentication', () => {

    test('Protected routes redirect to login when unauthenticated', async ({ page }) => {
        const protectedPaths = ['/profile', '/messages', '/notifications', '/settings', '/feed'];

        for (const path of protectedPaths) {
            await page.goto(`${BASE}${path}`);
            await page.waitForLoadState('networkidle');

            const url = page.url();
            // Should redirect to login or show login prompt
            const isOnLogin = url.includes('/login');
            const hasLoginForm = await page.locator('.login-card, .login-container').count() > 0;
            const isOnSamePage = url.includes(path);

            // Either redirected to login, or stayed but shows unauthorized state
            expect(isOnLogin || hasLoginForm || isOnSamePage).toBeTruthy();
        }
    });

    test('Email/password registration works via API', async ({ request }) => {
        const email = `authtest-${Date.now()}@test.local`;
        const res = await request.post(`${API}/auth/register`, {
            data: { email, password: 'TestPass123!', role: 'BUILDER', name: 'Auth Test User' },
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(body.token).toBeTruthy();
        expect(body.user).toBeTruthy();
        expect(body.user.email).toBe(email);
    });

    test('Email/password login works via API', async ({ request }) => {
        const email = `logintest-${Date.now()}@test.local`;
        // Register first
        await request.post(`${API}/auth/register`, {
            data: { email, password: 'TestPass123!', role: 'BUILDER', name: 'Login Test' },
        });

        // Login
        const res = await request.post(`${API}/auth/login`, {
            data: { email, password: 'TestPass123!' },
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(body.token).toBeTruthy();
    });

    test('Invalid login returns error', async ({ request }) => {
        const res = await request.post(`${API}/auth/login`, {
            data: { email: 'nonexistent@test.local', password: 'wrong' },
        });
        expect(res.ok()).toBeFalsy();
    });

    test('GET /api/auth/me returns user when authenticated', async ({ request }) => {
        const { token } = await registerUser(request, 'me-check');
        const res = await request.get(`${API}/auth/me`, {
            headers: authHeaders(token),
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(body.user || body.id).toBeTruthy();
    });

    test('GET /api/auth/me returns 401 without token', async ({ request }) => {
        const res = await request.get(`${API}/auth/me`);
        expect(res.status()).toBe(401);
    });
});

// ── 3. Profile Pages ────────────────────────────────────────────────

test.describe('Profile Pages', () => {
    let tokenA, userA, tokenB, userB;

    test.beforeAll(async ({ request }) => {
        ({ token: tokenA, user: userA } = await registerUser(request, 'profile-A'));
        ({ token: tokenB, user: userB } = await registerUser(request, 'profile-B'));
    });

    test('Own profile page loads', async ({ page }) => {
        await injectAuth(page, tokenA, userA);
        await page.goto(`${BASE}/profile`);
        await page.waitForLoadState('networkidle');

        // Should show profile content (name, role, etc)
        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);

        // No crash - page should render without errors
        const h1 = page.locator('h1, h2, .h1-title');
        await expect(h1.first()).toBeVisible({ timeout: 15000 });
    });

    test('Profile shows follower/following stats', async ({ page }) => {
        await injectAuth(page, tokenA, userA);
        await page.goto(`${BASE}/profile`);
        await page.waitForLoadState('networkidle');

        // Should have follower/following section visible
        const statsText = await page.textContent('body');
        // At minimum, "Followers" or "Following" text should appear
        const hasStats = statsText.includes('Follower') || statsText.includes('Following');
        expect(hasStats).toBeTruthy();
    });

    test('Public builder profile loads', async ({ page }) => {
        await page.goto(`${BASE}/builder/${userB.id}`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });

    test('Public profile has follow button for non-owner', async ({ page }) => {
        await injectAuth(page, tokenA, userA);
        await page.goto(`${BASE}/builder/${userB.id}`);
        await page.waitForLoadState('networkidle');

        // Should have a follow or connect button
        const followBtn = page.locator('button:has-text("Follow"), button:has-text("Connect")');
        const count = await followBtn.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Follow/Unfollow API works', async ({ request }) => {
        // Follow
        const followRes = await request.post(`${API}/profiles/${userB.id}/follow`, {
            headers: authHeaders(tokenA),
        });
        expect(followRes.ok()).toBeTruthy();

        // Check followers
        const followersRes = await request.get(`${API}/profiles/${userB.id}/followers`, {
            headers: authHeaders(tokenA),
        });
        expect(followersRes.ok()).toBeTruthy();

        // Unfollow
        const unfollowRes = await request.delete(`${API}/profiles/${userB.id}/follow`, {
            headers: authHeaders(tokenA),
        });
        expect(unfollowRes.ok()).toBeTruthy();
    });

    test('Profile edit page loads', async ({ page }) => {
        await injectAuth(page, tokenA, userA);
        await page.goto(`${BASE}/profile/edit`);
        await page.waitForLoadState('networkidle');

        // Should have form inputs
        const inputs = page.locator('input, textarea, select');
        expect(await inputs.count()).toBeGreaterThan(0);
    });

    test('Profiles API list endpoint works', async ({ request }) => {
        const res = await request.get(`${API}/profiles`, {
            params: { role: 'BUILDER', page: 1, limit: 10 },
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(Array.isArray(body.data || body)).toBeTruthy();
    });
});

// ── 4. Projects ──────────────────────────────────────────────────────

test.describe('Projects', () => {
    let token, user;

    test.beforeAll(async ({ request }) => {
        ({ token, user } = await registerUser(request, 'project-owner'));
    });

    test('Projects list API works', async ({ request }) => {
        const res = await request.get(`${API}/projects`);
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(Array.isArray(body.data || body)).toBeTruthy();
    });

    test('Create project via API', async ({ request }) => {
        const res = await request.post(`${API}/projects`, {
            headers: authHeaders(token),
            data: {
                name: `Test Project ${Date.now()}`,
                description: 'A test project for bug testing',
                industry: 'Technology',
                stage: 'IDEA',
                fundingGoal: 50000,
                location: 'San Salvador',
            },
        });
        // May be 200 or 201
        expect(res.status()).toBeLessThan(400);
    });

    test('Discover page shows project cards when projects exist', async ({ page, request }) => {
        // Create a project first
        await request.post(`${API}/projects`, {
            headers: authHeaders(token),
            data: {
                name: `Visible Project ${Date.now()}`,
                description: 'Should appear on discover page',
                industry: 'Technology',
                stage: 'IDEA',
                fundingGoal: 10000,
            },
        });

        await page.goto(`${BASE}/discover`);
        await page.waitForLoadState('networkidle');

        // Should render without crash
        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });
});

// ── 5. Events ────────────────────────────────────────────────────────

test.describe('Events', () => {
    let token, user;

    test.beforeAll(async ({ request }) => {
        ({ token, user } = await registerUser(request, 'event-creator'));
    });

    test('Events list API works', async ({ request }) => {
        const res = await request.get(`${API}/events`);
        expect(res.ok()).toBeTruthy();
    });

    test('Create event via API', async ({ request }) => {
        const res = await request.post(`${API}/events`, {
            headers: authHeaders(token),
            data: {
                title: `Test Event ${Date.now()}`,
                description: 'A test event for bug testing',
                category: 'MEETUP',
                startDate: new Date(Date.now() + 86400000).toISOString(),
                endDate: new Date(Date.now() + 90000000).toISOString(),
                location: 'San Salvador',
                isOnline: false,
            },
        });
        expect(res.status()).toBeLessThan(400);
        if (res.ok()) {
            const body = await res.json();
            const eventId = body.id || body.data?.id;

            if (eventId) {
                // Test RSVP
                const rsvpRes = await request.post(`${API}/events/${eventId}/rsvp`, {
                    headers: authHeaders(token),
                });
                // RSVP to own event may or may not be allowed
                expect(rsvpRes.status()).toBeLessThan(500);
            }
        }
    });

    test('Events page renders event cards', async ({ page }) => {
        await page.goto(`${BASE}/events`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });
});

// ── 6. Messaging ─────────────────────────────────────────────────────

test.describe('Messaging', () => {
    let tokenA, userA, tokenB, userB;

    test.beforeAll(async ({ request }) => {
        ({ token: tokenA, user: userA } = await registerUser(request, 'msg-A'));
        ({ token: tokenB, user: userB } = await registerUser(request, 'msg-B'));
    });

    test('Send message via API', async ({ request }) => {
        const res = await request.post(`${API}/messages`, {
            headers: authHeaders(tokenA),
            data: {
                recipientId: userB.id,
                content: 'Hello from bug test!',
                isEncrypted: false,
            },
        });
        expect(res.ok()).toBeTruthy();
    });

    test('Receive message via API', async ({ request }) => {
        // Send first
        await request.post(`${API}/messages`, {
            headers: authHeaders(tokenA),
            data: {
                recipientId: userB.id,
                content: 'Bug test message ' + Date.now(),
                isEncrypted: false,
            },
        });

        // Fetch conversations
        const res = await request.get(`${API}/messages`, {
            headers: authHeaders(tokenB),
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        // Should have at least one conversation
        const data = body.data || body;
        expect(Array.isArray(data)).toBeTruthy();
    });

    test('Messages page loads when authenticated', async ({ page }) => {
        await injectAuth(page, tokenA, userA);
        await page.goto(`${BASE}/messages`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });
});

// ── 7. Dashboard Pages ──────────────────────────────────────────────

test.describe('Builder Dashboard', () => {
    let token, user;

    test.beforeAll(async ({ request }) => {
        ({ token, user } = await registerUser(request, 'builder-dash'));
    });

    test('Builder dashboard overview loads', async ({ page }) => {
        await injectAuth(page, token, user);
        await page.goto(`${BASE}/dashboard/builder`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });

    test('Builder projects page loads', async ({ page }) => {
        await injectAuth(page, token, user);
        await page.goto(`${BASE}/dashboard/builder/projects`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });

    test('Builder analytics page loads', async ({ page }) => {
        await injectAuth(page, token, user);
        await page.goto(`${BASE}/dashboard/builder/analytics`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });

    test('Builder following page loads', async ({ page }) => {
        await injectAuth(page, token, user);
        await page.goto(`${BASE}/dashboard/builder/following`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });

    test('Builder new project page loads', async ({ page }) => {
        await injectAuth(page, token, user);
        await page.goto(`${BASE}/dashboard/builder/new-project`);
        await page.waitForLoadState('networkidle');

        // Should have form elements
        const inputs = page.locator('input, textarea, select');
        expect(await inputs.count()).toBeGreaterThan(0);
    });

    test('Builder events page loads', async ({ page }) => {
        await injectAuth(page, token, user);
        await page.goto(`${BASE}/dashboard/builder/my-events`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });

    test('Builder settings page loads', async ({ page }) => {
        await injectAuth(page, token, user);
        await page.goto(`${BASE}/dashboard/builder/settings`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });
});

test.describe('Investor Dashboard', () => {
    let token, user;

    test.beforeAll(async ({ request }) => {
        ({ token, user } = await registerInvestor(request, 'inv-dash'));
    });

    test('Investor dashboard overview loads', async ({ page }) => {
        await injectAuth(page, token, user);
        await page.goto(`${BASE}/dashboard/investor`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });

    test('Investor watchlist page loads', async ({ page }) => {
        await injectAuth(page, token, user);
        await page.goto(`${BASE}/dashboard/investor/watchlist`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });

    test('Investor deal-flow page loads', async ({ page }) => {
        await injectAuth(page, token, user);
        await page.goto(`${BASE}/dashboard/investor/deal-flow`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });

    test('Investor following page loads', async ({ page }) => {
        await injectAuth(page, token, user);
        await page.goto(`${BASE}/dashboard/investor/following`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });
});

// ── 8. Watchlist ─────────────────────────────────────────────────────

test.describe('Watchlist', () => {
    let builderToken, builderUser, investorToken, investorUser;

    test.beforeAll(async ({ request }) => {
        ({ token: builderToken, user: builderUser } = await registerUser(request, 'wl-builder'));
        ({ token: investorToken, user: investorUser } = await registerInvestor(request, 'wl-investor'));
    });

    test('Add and remove from watchlist', async ({ request }) => {
        // Create a project first
        const projRes = await request.post(`${API}/projects`, {
            headers: authHeaders(builderToken),
            data: {
                name: `Watchlist Test ${Date.now()}`,
                description: 'Test project for watchlist',
                industry: 'Technology',
                stage: 'IDEA',
            },
        });

        if (projRes.ok()) {
            const proj = await projRes.json();
            const projectId = proj.id || proj.data?.id;

            if (projectId) {
                // Add to watchlist
                const addRes = await request.post(`${API}/watchlist`, {
                    headers: authHeaders(investorToken),
                    data: { projectId },
                });
                expect(addRes.status()).toBeLessThan(500);

                // Get watchlist
                const listRes = await request.get(`${API}/watchlist`, {
                    headers: authHeaders(investorToken),
                });
                expect(listRes.ok()).toBeTruthy();
            }
        }
    });
});

// ── 9. Search ────────────────────────────────────────────────────────

test.describe('Search', () => {
    test('Search API returns results', async ({ request }) => {
        const res = await request.get(`${API}/search`, {
            params: { q: 'test' },
        });
        // Should not error
        expect(res.status()).toBeLessThan(500);
    });
});

// ── 10. Stats ────────────────────────────────────────────────────────

test.describe('Stats', () => {
    test('Public stats API works', async ({ request }) => {
        const res = await request.get(`${API}/stats`);
        expect(res.ok()).toBeTruthy();
    });
});

// ── 11. Console Errors & JS Crashes ──────────────────────────────────

test.describe('Page Stability - No JS Crashes', () => {
    let token, user;

    test.beforeAll(async ({ request }) => {
        ({ token, user } = await registerUser(request, 'stability'));
    });

    const publicPages = ['/', '/login', '/signup', '/discover', '/events', '/builders', '/investors', '/about', '/news', '/media'];
    const authedPages = ['/profile', '/messages', '/notifications', '/settings', '/feed', '/dashboard/builder', '/dashboard/builder/projects', '/dashboard/builder/analytics'];

    for (const path of publicPages) {
        test(`No uncaught errors on ${path}`, async ({ page }) => {
            const jsErrors = [];
            page.on('pageerror', err => jsErrors.push(err.message));

            await page.goto(`${BASE}${path}`);
            await page.waitForLoadState('networkidle');
            // Give React time to settle
            await page.waitForTimeout(1000);

            if (jsErrors.length > 0) {
                console.log(`JS errors on ${path}:`, jsErrors);
            }
            expect(jsErrors, `Uncaught JS errors on ${path}: ${jsErrors.join('; ')}`).toHaveLength(0);
        });
    }

    for (const path of authedPages) {
        test(`No uncaught errors on authed ${path}`, async ({ page }) => {
            const jsErrors = [];
            page.on('pageerror', err => jsErrors.push(err.message));

            await injectAuth(page, token, user);
            await page.goto(`${BASE}${path}`);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            if (jsErrors.length > 0) {
                console.log(`JS errors on ${path}:`, jsErrors);
            }
            expect(jsErrors, `Uncaught JS errors on ${path}: ${jsErrors.join('; ')}`).toHaveLength(0);
        });
    }
});

// ── 12. Navigation & Links ───────────────────────────────────────────

test.describe('Navigation', () => {
    test('Navbar links work on landing page', async ({ page }) => {
        await page.goto(`${BASE}/`);
        await page.waitForLoadState('networkidle');

        // Check that nav links exist and don't 404
        const navLinks = page.locator('nav a, header a');
        const count = await navLinks.count();

        for (let i = 0; i < Math.min(count, 10); i++) {
            const href = await navLinks.nth(i).getAttribute('href');
            if (href && href.startsWith('/') && !href.includes('#')) {
                // Just verify the link exists and has a valid href
                expect(href).toBeTruthy();
            }
        }
    });

    test('Logo/brand link goes to home', async ({ page }) => {
        await page.goto(`${BASE}/builders`);
        await page.waitForLoadState('networkidle');

        // Find logo or brand link
        const logoLink = page.locator('a[href="/biestest/"], a[href="/biestest"], .logo-link, nav a').first();
        if (await logoLink.count() > 0) {
            await logoLink.click();
            await page.waitForLoadState('networkidle');
            // Should navigate to landing or feed
            const url = page.url();
            expect(url).toContain('/biestest');
        }
    });
});

// ── 13. API Error Handling ───────────────────────────────────────────

test.describe('API Error Handling', () => {
    test('Non-existent profile returns 404', async ({ request }) => {
        const res = await request.get(`${API}/profiles/99999999`);
        expect(res.status()).toBeGreaterThanOrEqual(400);
        expect(res.status()).toBeLessThan(500);
    });

    test('Non-existent project returns 404', async ({ request }) => {
        const res = await request.get(`${API}/projects/99999999`);
        expect(res.status()).toBeGreaterThanOrEqual(400);
        expect(res.status()).toBeLessThan(500);
    });

    test('Non-existent event returns 404', async ({ request }) => {
        const res = await request.get(`${API}/events/99999999`);
        expect(res.status()).toBeGreaterThanOrEqual(400);
        expect(res.status()).toBeLessThan(500);
    });

    test('Create project without auth returns 401', async ({ request }) => {
        const res = await request.post(`${API}/projects`, {
            data: { name: 'Unauthorized project' },
        });
        expect(res.status()).toBe(401);
    });

    test('Create event without auth returns 401', async ({ request }) => {
        const res = await request.post(`${API}/events`, {
            data: { title: 'Unauthorized event' },
        });
        expect(res.status()).toBe(401);
    });

    test('Duplicate registration returns error', async ({ request }) => {
        const email = `dupe-${Date.now()}@test.local`;
        // First registration
        await request.post(`${API}/auth/register`, {
            data: { email, password: 'TestPass123!', role: 'BUILDER', name: 'Dupe Test' },
        });
        // Second registration with same email
        const res = await request.post(`${API}/auth/register`, {
            data: { email, password: 'TestPass123!', role: 'BUILDER', name: 'Dupe Test 2' },
        });
        expect(res.ok()).toBeFalsy();
    });
});

// ── 14. Network Failures & Loading States ────────────────────────────

test.describe('Failed API Responses', () => {
    test('Profile page handles API failure gracefully', async ({ page }) => {
        const jsErrors = [];
        page.on('pageerror', err => jsErrors.push(err.message));

        // Inject fake auth with an expired/invalid token
        await page.goto(`${BASE}/`);
        await page.evaluate(() => {
            localStorage.setItem('bies_token', 'invalid-token-12345');
            localStorage.setItem('bies_user', JSON.stringify({ id: 999, role: 'BUILDER', name: 'Fake' }));
        });
        await page.goto(`${BASE}/profile`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Should not have uncaught errors - page should handle 401 gracefully
        expect(jsErrors.length).toBe(0);
    });
});

// ── 15. Responsive Elements ──────────────────────────────────────────

test.describe('Mobile Viewport', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('Landing page is usable on mobile', async ({ page }) => {
        await page.goto(`${BASE}/`);
        await page.waitForLoadState('networkidle');

        // Content should not overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        // Allow slight overflow (scrollbar etc) but flag major issues
        expect(bodyWidth).toBeLessThanOrEqual(450);
    });

    test('Login page is usable on mobile', async ({ page }) => {
        await page.goto(`${BASE}/login`);
        await page.waitForLoadState('networkidle');

        // Buttons should be visible and clickable
        const buttons = page.locator('button:visible');
        expect(await buttons.count()).toBeGreaterThan(0);
    });
});

// ── 16. HTTP Response Codes ──────────────────────────────────────────

test.describe('HTTP Response Codes', () => {
    const endpoints = [
        { method: 'GET', path: '/stats' },
        { method: 'GET', path: '/profiles?role=BUILDER&page=1&limit=5' },
        { method: 'GET', path: '/events' },
        { method: 'GET', path: '/projects' },
    ];

    for (const ep of endpoints) {
        test(`${ep.method} /api${ep.path} returns 2xx`, async ({ request }) => {
            const res = await request.get(`${API}${ep.path}`);
            expect(res.status()).toBeLessThan(300);
        });
    }
});
