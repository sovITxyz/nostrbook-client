import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReport, createReportSchema, listReports, updateReport } from '../controllers/report.controller';

const router = Router();
router.post('/', authenticate, validate(createReportSchema), createReport);

// Admin report management (mounted under /api/admin/reports via admin.routes.ts)
export const adminReportRouter = Router();
adminReportRouter.get('/', listReports);
adminReportRouter.put('/:id', updateReport);

export default router;
