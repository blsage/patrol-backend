import { Router } from 'express';
import { createUser, getUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { getUsersByNeighborhood } from '../controllers/userController';

const router = Router();

router.post('/', authenticateJWT, createUser);
router.get('/me', authenticateJWT, getUser);
router.patch('/me', authenticateJWT, updateUser);
router.delete('/me', authenticateJWT, deleteUser);

router.get('/neighborhood/:neighborhoodId', authenticateJWT, getUsersByNeighborhood);

export default router;