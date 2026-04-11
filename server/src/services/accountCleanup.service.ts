import prisma from '../lib/prisma';

const GRACE_PERIOD_DAYS = 30;
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export function startAccountCleanup(): void {
    // Run once on startup, then every 24 hours
    runCleanup();
    setInterval(runCleanup, CLEANUP_INTERVAL);
}

async function runCleanup(): Promise<void> {
    try {
        const cutoff = new Date(Date.now() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        const expiredUsers = await prisma.user.findMany({
            where: { deletedAt: { lt: cutoff, not: null } },
            select: { id: true },
        });

        for (const user of expiredUsers) {
            await prisma.user.delete({ where: { id: user.id } });
            console.log(`[Cleanup] Permanently deleted user ${user.id}`);
        }

        if (expiredUsers.length > 0) {
            console.log(`[Cleanup] Purged ${expiredUsers.length} expired accounts`);
        }
    } catch (error) {
        console.error('[Cleanup] Account cleanup error:', error);
    }
}
