/**
 * Community membership service — manages relay access via WoT events.
 *
 * Instead of a flat-file whitelist, the community identity publishes:
 * - Kind 3 (contact list): all active members as 'p' tags → WoT degree 1
 * - Kind 10000 (mute list): banned users as 'p' tags → rejected by WoT policy
 */

import type { EventTemplate } from 'nostr-tools/pure';
import { config } from '../config';
import prisma from '../lib/prisma';

const HEX_PUBKEY_RE = /^[0-9a-f]{64}$/;

let _pool: InstanceType<Awaited<typeof import('nostr-tools/pool')>['SimplePool']> | null = null;
async function getPool() {
    if (!_pool) {
        const { SimplePool } = await import('nostr-tools/pool');
        _pool = new SimplePool();
    }
    return _pool;
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

/**
 * Publish a signed event using the community identity keypair.
 */
async function publishCommunityEvent(event: EventTemplate): Promise<boolean> {
    if (!config.communityPrivkey) {
        console.warn('[Membership] No COMMUNITY_PRIVKEY configured, skipping relay event');
        return false;
    }

    try {
        const { finalizeEvent } = await import('nostr-tools/pure');
        const privkeyBytes = hexToBytes(config.communityPrivkey);
        const signed = finalizeEvent(event, privkeyBytes);

        const pool = await getPool();
        const relays = config.nostrPrivateRelay ? [config.nostrPrivateRelay] : [];
        if (relays.length === 0) {
            console.warn('[Membership] No NOSTR_PRIVATE_RELAY configured');
            return false;
        }

        const results = await Promise.allSettled(pool.publish(relays, signed));
        const published = results.filter((r) => r.status === 'fulfilled').length;
        console.log(`[Membership] Published kind ${event.kind} to ${published}/${relays.length} relays`);
        return published > 0;
    } catch (err) {
        console.error('[Membership] Publish error:', err);
        return false;
    }
}

/**
 * Publish an updated kind-3 contact list with all active community members.
 * This is a replaceable event — each publish replaces the previous one.
 */
async function publishContactList(): Promise<boolean> {
    const members = await prisma.user.findMany({
        where: { isBanned: false, nostrPubkey: { not: null } },
        select: { nostrPubkey: true },
    });

    const tags: string[][] = members
        .filter((m) => m.nostrPubkey && HEX_PUBKEY_RE.test(m.nostrPubkey))
        .map((m) => ['p', m.nostrPubkey!]);

    const event: EventTemplate = {
        kind: 3,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: '',
    };

    return publishCommunityEvent(event);
}

/**
 * Publish a kind-10000 mute list with all banned community members.
 * This is a replaceable event — each publish replaces the previous one.
 */
async function publishMuteList(): Promise<boolean> {
    const banned = await prisma.user.findMany({
        where: { isBanned: true, nostrPubkey: { not: null } },
        select: { nostrPubkey: true },
    });

    const tags: string[][] = banned
        .filter((m) => m.nostrPubkey && HEX_PUBKEY_RE.test(m.nostrPubkey))
        .map((m) => ['p', m.nostrPubkey!]);

    const event: EventTemplate = {
        kind: 10000,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: '',
    };

    return publishCommunityEvent(event);
}

// Debounce contact list publishing to avoid flooding the relay
// when multiple users register in quick succession.
let contactListTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedPublishContactList(): void {
    if (contactListTimer) clearTimeout(contactListTimer);
    contactListTimer = setTimeout(() => {
        publishContactList().catch((err) =>
            console.error('[Membership] Contact list publish failed:', err)
        );
    }, 2000);
}

/**
 * Grant a pubkey access to the community relay.
 * Publishes an updated kind-3 contact list including this member.
 */
export function addCommunityMember(pubkey: string): void {
    if (!HEX_PUBKEY_RE.test(pubkey)) {
        console.error('[Membership] Invalid pubkey format');
        return;
    }
    console.log(`[Membership] Adding ${pubkey.substring(0, 8)}...`);
    debouncedPublishContactList();
}

/**
 * Revoke a pubkey's access to the community relay.
 * Publishes updated kind-3 (without member) and kind-10000 (with member muted).
 */
export function removeCommunityMember(pubkey: string): void {
    if (!HEX_PUBKEY_RE.test(pubkey)) {
        console.error('[Membership] Invalid pubkey format');
        return;
    }
    console.log(`[Membership] Removing ${pubkey.substring(0, 8)}...`);
    debouncedPublishContactList();
    publishMuteList().catch((err) =>
        console.error('[Membership] Mute list publish failed:', err)
    );
}
