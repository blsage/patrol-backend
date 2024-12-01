import { Router } from 'express';
import { createUser, getUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateJWT, createUser);
router.get('/me', authenticateJWT, getUser);
router.patch('/me', authenticateJWT, updateUser);
router.delete('/me', authenticateJWT, deleteUser);

export default router;