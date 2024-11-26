import { Router } from 'express';
import { sendCode, verifyCodeEndpoint } from '../controllers/authController';

const router = Router();

router.post('/send-code', sendCode);
router.post('/verify-code', verifyCodeEndpoint);

export default router;