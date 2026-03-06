import { Router } from 'express';
import { register, login, refresh, getMe, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
