import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { getNeighborhoodSummary } from '../controllers/neighborhoodController';

const router = Router();

router.get('/:id/summary', authenticateJWT, getNeighborhoodSummary);

export default router;