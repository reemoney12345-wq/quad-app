import { Router } from 'express';
import { getUpdates, createUpdate, verifyUpdate } from '../controllers/updateController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getUpdates);
router.post('/', authenticate, createUpdate);
router.post('/:id/verify', authenticate, verifyUpdate);

export default router;