import { Router } from 'express';
import { getContributions, createContribution } from '../controllers/contributionController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateJWT, createContribution);
router.get('/neighborhoods/:neighborhoodId/contributions', authenticateJWT, getContributions);

export default router;
