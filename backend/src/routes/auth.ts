import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, (req: AuthRequest, res) => getMe(req, res));

export default router;