import { Router } from 'express';
import { getRooms, createRoom, updateRoomStatus, deleteRoom } from '../controllers/roomController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getRooms);
router.post('/', authenticate, createRoom);
router.patch('/:id/status', authenticate, updateRoomStatus);
router.delete('/:id', authenticate, deleteRoom);

export default router;