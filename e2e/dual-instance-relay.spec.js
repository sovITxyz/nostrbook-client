/**
 * Dual-instance E2E relay test.
 *
 * Verifies:
 *   1. Both Docker instances are reachable (health + UI)
 *   2. Each instance's relay WebSocket accepts connections
 *   3. A post on Instance A appears on A but NOT on B (relay isolation)
 *   4. A post on Instance B appears on B but NOT on A (relay isolation)
 *
 * Requires docker-compose.e2e.yml running:
 *   Instance A — http://localhost:8082  (relay via /relay)
 *   Instance B — http://localhost:8083  (relay via /relay)
 */

import { test, expect } from '@playwright/test';

// When using docker-compose.e2e.yml: 8082/8083
// When using scripts/e2e-dual-start.sh (dev): 5173/5174
const INSTANCE_A = process.env.E2E_INSTANCE_A || 'http://localhost:5173';
const INSTANCE_B = process.env.E2E_INSTANCE_B || 'http://localhost:5174';
const API_A = `${INSTANCE_A}/api`;
const API_B = `${INSTANCE_B}/api`;

// ── Helpers ──────────────────────────────────────────────────────────

async function generateKeypair() {
    const { generateSecretKey, getPublicKey } = await import('nostr-tools/pure');
    const { nip19 } = await import('nostr-tools');
    const sk = generateSecretKey();
    const pk = getPublicKey(sk);
    const nsec = nip19.nsecEncode(sk);
    const skHex = Buffer.from(sk).toString('hex');
    return { sk, skHex, pk, nsec };
}

async function signEvent(event, sk) {
    const { finalizeEvent } = await import('nostr-tools/pure');
    return finalizeEvent(event, sk);
}

async function nostrLogin(request, apiBase, sk, pk) {
    const challengeRes = await request.get(`${apiBase}/auth/nostr-challenge?pubkey=${pk}`);
    expect(challengeRes.ok(), `Challenge failed on ${apiBase}: ${challengeRes.status()}`).toBeTruthy();
    const { challenge } = await challengeRes.json();

    const signed = await signEvent({
        kind: 27235,
        pubkey: pk,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: challenge,
    }, sk);

    const loginRes = await request.post(`${apiBase}/auth/nostr-login`, {
        data: { pubkey: pk, signedEvent: signed },
    });
    expect(loginRes.ok(), `Login failed on ${apiBase}: ${loginRes.status()}`).toBeTruthy();
    const body = await loginRes.json();
    return { token: body.token, user: body.user };
}

async function injectAuth(page, baseURL, token, user, skHex) {
    if (skHex) {
        await page.addInitScript(({ nsecHex }) => {
            window.__TEST_NSEC_HEX = nsecHex;
        }, { nsecHex: skHex });
    }
    await page.goto(baseURL + '/');
    await page.evaluate(({ token, user }) => {
        localStorage.setItem('bies_token', token);
        localStorage.setItem('bies_user', JSON.stringify(user));
        localStorage.setItem('bies_login_method', 'nsec');
    }, { token, user });
}

async function setSigner(page, skHex) {
    await page.evaluate(async ({ skHex }) => {
        const skBytes = new Uint8Array(skHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        const signerModule = await import('/src/services/nostrSigner.js');
        signerModule.nostrSigner.setNsec(skBytes);
    }, { skHex });
}

// ── Tests ────────────────────────────────────────────────────────────

test.describe('Dual Instance Health', () => {
    test('Instance A API is healthy', async ({ request }) => {
        const res = await request.get(`${API_A}/health`);
        expect(res.ok()).toBeTruthy();
    });

    test('Instance B API is healthy', async ({ request }) => {
        const res = await request.get(`${API_B}/health`);
        expect(res.ok()).toBeTruthy();
    });

    test('Instance A serves the frontend', async ({ page }) => {
        await page.goto(INSTANCE_A);
        await expect(page).toHaveTitle(/.+/, { timeout: 15000 });
    });

    test('Instance B serves the frontend', async ({ page }) => {
        await page.goto(INSTANCE_B);
        await expect(page).toHaveTitle(/.+/, { timeout: 15000 });
    });
});

test.describe('Relay WebSocket Connectivity', () => {
    test('Instance A relay accepts WebSocket connections', async ({ page }) => {
        await page.goto(INSTANCE_A);
        const connected = await page.evaluate(async () => {
            return new Promise((resolve) => {
                const wsUrl = `ws://${window.location.host}/relay`;
                const ws = new WebSocket(wsUrl);
                const timeout = setTimeout(() => { ws.close(); resolve(false); }, 10000);
                ws.onopen = () => { clearTimeout(timeout); ws.close(); resolve(true); };
                ws.onerror = () => { clearTimeout(timeout); resolve(false); };
            });
        });
        expect(connected, 'Instance A relay WS should connect').toBe(true);
    });

    test('Instance B relay accepts WebSocket connections', async ({ page }) => {
        await page.goto(INSTANCE_B);
        const connected = await page.evaluate(async () => {
            return new Promise((resolve) => {
                const wsUrl = `ws://${window.location.host}/relay`;
                const ws = new WebSocket(wsUrl);
                const timeout = setTimeout(() => { ws.close(); resolve(false); }, 10000);
                ws.onopen = () => { clearTimeout(timeout); ws.close(); resolve(true); };
                ws.onerror = () => { clearTimeout(timeout); resolve(false); };
            });
        });
        expect(connected, 'Instance B relay WS should connect').toBe(true);
    });
});

test.describe('Relay Isolation - Posts stay on their own instance', () => {
    let keysA, authA;
    let keysB, authB;

    test.beforeAll(async ({ request }) => {
        keysA = await generateKeypair();
        authA = await nostrLogin(request, API_A, keysA.sk, keysA.pk);

        keysB = await generateKeypair();
        authB = await nostrLogin(request, API_B, keysB.sk, keysB.pk);
    });

    test('post on Instance A visible on A, not on B', async ({ browser }) => {
        const uniqueMsg = `Instance-A-only ${Date.now()}`;

        // Post on Instance A
        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await injectAuth(pageA, INSTANCE_A, authA.token, authA.user, keysA.skHex);
        await pageA.goto(INSTANCE_A + '/feed');
        await setSigner(pageA, keysA.skHex);

        // Wait for the Private nostr tab (feed is loaded)
        const privateTab = pageA.getByRole('button', { name: /Private nostr/i });
        await expect(privateTab).toBeVisible({ timeout: 20000 });

        // Type in compose box and post
        const composeInput = pageA.getByPlaceholder(/what.*happening/i);
        await expect(composeInput).toBeVisible({ timeout: 10000 });
        await composeInput.fill(uniqueMsg);

        const postBtn = pageA.getByRole('button', { name: 'Post' });
        await expect(postBtn).toBeEnabled({ timeout: 5000 });
        await postBtn.click();
        await expect(composeInput).toHaveValue('', { timeout: 15000 });

        // Verify our post appears on A's feed
        const postOnA = pageA.getByText(uniqueMsg);
        await expect(postOnA).toBeVisible({ timeout: 30000 });

        // Now check it does NOT appear on B
        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await injectAuth(pageB, INSTANCE_B, authB.token, authB.user, keysB.skHex);
        await pageB.goto(INSTANCE_B + '/feed');
        await setSigner(pageB, keysB.skHex);

        const privateTabB = pageB.getByRole('button', { name: /Private nostr/i });
        await expect(privateTabB).toBeVisible({ timeout: 20000 });

        // Wait for feed to settle
        await pageB.waitForTimeout(5000);

        const postOnB = pageB.getByText(uniqueMsg);
        await expect(postOnB).toBeHidden({ timeout: 5000 });

        await ctxA.close();
        await ctxB.close();
    });

    test('post on Instance B visible on B, not on A', async ({ browser }) => {
        const uniqueMsg = `Instance-B-only ${Date.now()}`;

        // Post on Instance B
        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await injectAuth(pageB, INSTANCE_B, authB.token, authB.user, keysB.skHex);
        await pageB.goto(INSTANCE_B + '/feed');
        await setSigner(pageB, keysB.skHex);

        const privateTab = pageB.getByRole('button', { name: /Private nostr/i });
        await expect(privateTab).toBeVisible({ timeout: 20000 });

        const composeInput = pageB.getByPlaceholder(/what.*happening/i);
        await expect(composeInput).toBeVisible({ timeout: 10000 });
        await composeInput.fill(uniqueMsg);

        const postBtn = pageB.getByRole('button', { name: 'Post' });
        await expect(postBtn).toBeEnabled({ timeout: 5000 });
        await postBtn.click();
        await expect(composeInput).toHaveValue('', { timeout: 15000 });

        // Verify on B
        const postOnB = pageB.getByText(uniqueMsg);
        await expect(postOnB).toBeVisible({ timeout: 30000 });

        // Check NOT on A
        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await injectAuth(pageA, INSTANCE_A, authA.token, authA.user, keysA.skHex);
        await pageA.goto(INSTANCE_A + '/feed');
        await setSigner(pageA, keysA.skHex);

        const privateTabA = pageA.getByRole('button', { name: /Private nostr/i });
        await expect(privateTabA).toBeVisible({ timeout: 20000 });

        await pageA.waitForTimeout(5000);

        const postOnA = pageA.getByText(uniqueMsg);
        await expect(postOnA).toBeHidden({ timeout: 5000 });

        await ctxA.close();
        await ctxB.close();
    });
});
