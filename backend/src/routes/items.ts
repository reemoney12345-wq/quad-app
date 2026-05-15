import { Router } from 'express';
import { getItems, createItem, claimItem } from '../controllers/itemController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getItems);
router.post('/', authenticate, upload.single('image'), createItem);
router.patch('/:id/claim', authenticate, claimItem);

export default router;