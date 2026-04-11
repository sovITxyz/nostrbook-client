import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { blockUser, unblockUser, listBlocked } from '../controllers/block.controller';

const router = Router();
router.use(authenticate);
router.get('/', listBlocked);
router.post('/:userId', blockUser);
router.delete('/:userId', unblockUser);

export default router;
