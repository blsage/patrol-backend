import { Response } from 'express';
import Stripe from 'stripe';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { showError } from '../utils/errorUtils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-08-16',
});

export const createContribution = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        showError(res, 401, 'Unauthorized');
        return;
    }

    const { amount, isMonthly } = req.body;

    if (!amount || typeof amount !== 'number') {
        showError(res, 400, 'Invalid amount.');
        return;
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            metadata: {
                userId: userId.toString(),
                isMonthly: isMonthly ? 'true' : 'false',
            },
        });

        res.status(200).json(paymentIntent.client_secret);
    } catch (error) {
        console.error('Error creating payment intent:', error);
        showError(res, 500, 'Failed to create payment intent.');
    }
};
