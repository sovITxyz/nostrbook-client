import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

export const createReportSchema = z.object({
    targetType: z.enum(['USER', 'POST', 'EVENT', 'PROJECT', 'MESSAGE']),
    targetId: z.string().min(1),
    reason: z.enum(['SPAM', 'HARASSMENT', 'VIOLENCE', 'ILLEGAL', 'NSFW', 'OTHER']),
    details: z.string().max(1000).optional(),
});

/**
 * POST /reports
 * Create a new report (authenticated users only).
 */
export async function createReport(req: Request, res: Response): Promise<void> {
    try {
        const { targetType, targetId, reason, details } = req.body;

        const report = await prisma.report.create({
            data: {
                reporterId: req.user!.id,
                targetType,
                targetId,
                reason,
                details: details ?? '',
            },
        });

        res.status(201).json({ message: 'Report submitted successfully', id: report.id });
    } catch (error: any) {
        // P2002 = unique constraint violation — user already reported this target
        if (error?.code === 'P2002') {
            res.status(200).json({ message: 'You have already reported this content' });
            return;
        }
        console.error('Create report error:', error);
        res.status(500).json({ error: 'Failed to submit report' });
    }
}

/**
 * GET /admin/reports
 * List reports with optional filters (admin only).
 */
export async function listReports(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user!.isAdmin) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 30));
        const status = req.query.status as string || '';
        const targetType = req.query.targetType as string || '';

        const where: any = {};
        if (status) where.status = status;
        if (targetType) where.targetType = targetType;

        const [data, total] = await Promise.all([
            prisma.report.findMany({
                where,
                include: {
                    reporter: {
                        select: {
                            id: true,
                            nostrPubkey: true,
                            profile: { select: { name: true, avatar: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.report.count({ where }),
        ]);

        res.json({
            data,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('List reports error:', error);
        res.status(500).json({ error: 'Failed to list reports' });
    }
}

/**
 * PUT /admin/reports/:id
 * Update a report's status, adminNote, etc. (admin only).
 */
export async function updateReport(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user!.isAdmin) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { id } = req.params;
        const { status, adminNote } = req.body;

        const data: any = {};

        if (status !== undefined) {
            const validStatuses = ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'];
            if (!validStatuses.includes(status)) {
                res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
                return;
            }
            data.status = status;
            data.reviewedBy = req.user!.id;
            data.reviewedAt = new Date();
        }

        if (adminNote !== undefined) {
            data.adminNote = adminNote;
        }

        if (Object.keys(data).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }

        const report = await prisma.report.update({
            where: { id },
            data,
            include: {
                reporter: {
                    select: {
                        id: true,
                        nostrPubkey: true,
                        profile: { select: { name: true, avatar: true } },
                    },
                },
            },
        });

        res.json(report);
    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({ error: 'Failed to update report' });
    }
}
