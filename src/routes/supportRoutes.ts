import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { createSupport } from '../controllers/supportController';

const router = Router();

router.post('/', authenticateJWT, createSupport);

export default router;