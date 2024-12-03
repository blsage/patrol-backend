import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhookController';

const router = Router();

import bodyParser from 'body-parser';

router.post(
  '/stripe',
  bodyParser.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;