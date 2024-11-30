import { Router } from 'express';
import { createUser, getUser } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateJWT, createUser);
router.get('/me', authenticateJWT, getUser);

export default router;