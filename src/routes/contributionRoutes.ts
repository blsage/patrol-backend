import { Router } from 'express';
import { createContribution } from '../controllers/contributionController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateJWT, createContribution);

export default router;
