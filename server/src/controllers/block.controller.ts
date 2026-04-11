import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * POST /blocks/:userId
 * Block a user.
 */
export async function blockUser(req: Request, res: Response): Promise<void> {
    try {
        const blockerId = req.user!.id;
        const blockedId = req.params.userId;

        // Prevent self-blocking
        if (blockerId === blockedId) {
            res.status(400).json({ error: 'You cannot block yourself' });
            return;
        }

        // Validate target user exists
        const target = await prisma.user.findUnique({ where: { id: blockedId } });
        if (!target) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        try {
            await prisma.block.create({
                data: { blockerId, blockedId },
            });
            res.status(201).json({ message: 'User blocked' });
        } catch (err: any) {
            // P2002 = already blocked
            if (err?.code === 'P2002') {
                res.status(200).json({ message: 'User is already blocked' });
                return;
            }
            throw err;
        }
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ error: 'Failed to block user' });
    }
}

/**
 * DELETE /blocks/:userId
 * Unblock a user.
 */
export async function unblockUser(req: Request, res: Response): Promise<void> {
    try {
        const blockerId = req.user!.id;
        const blockedId = req.params.userId;

        const existing = await prisma.block.findUnique({
            where: { blockerId_blockedId: { blockerId, blockedId } },
        });

        if (!existing) {
            res.status(404).json({ error: 'Block not found' });
            return;
        }

        await prisma.block.delete({
            where: { blockerId_blockedId: { blockerId, blockedId } },
        });

        res.json({ message: 'User unblocked' });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ error: 'Failed to unblock user' });
    }
}

/**
 * GET /blocks
 * List all users blocked by the current user.
 */
export async function listBlocked(req: Request, res: Response): Promise<void> {
    try {
        const blocks = await prisma.block.findMany({
            where: { blockerId: req.user!.id },
            include: {
                blocked: {
                    select: {
                        id: true,
                        nostrPubkey: true,
                        profile: { select: { name: true, avatar: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ data: blocks });
    } catch (error) {
        console.error('List blocked users error:', error);
        res.status(500).json({ error: 'Failed to list blocked users' });
    }
}

/**
 * Internal helper — returns a Set of user IDs blocked by the given user.
 * Not an HTTP endpoint; exported for use by other controllers.
 */
export async function getBlockedIds(userId: string): Promise<Set<string>> {
    const blocks = await prisma.block.findMany({
        where: { blockerId: userId },
        select: { blockedId: true },
    });
    return new Set(blocks.map((b) => b.blockedId));
}
