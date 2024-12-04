import { Response } from 'express';
import Stripe from 'stripe';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { showError } from '../utils/errorUtils';
import { getContributionsWithUserInfo } from '../models/contributionModel';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-08-16' as any,
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

export const getContributions = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { neighborhoodId } = req.params;
    const userId = req.user?.id;

    if (!neighborhoodId) {
        showError(res, 400, 'Neighborhood ID is required.');
        return;
    }

    if (!userId) {
        showError(res, 401, 'Unauthorized');
        return;
    }

    try {
        const neighborhoodIdInt = parseInt(neighborhoodId, 10);

        if (isNaN(neighborhoodIdInt)) {
            showError(res, 400, 'Invalid Neighborhood ID.');
            return;
        }

        const contributions = await getContributionsWithUserInfo(
            neighborhoodIdInt,
            userId
        );

        res.status(200).json(contributions);
    } catch (error) {
        const errorMessage =
            (error as Error).message || 'Failed to retrieve contributions.';
        showError(res, 500, errorMessage);
    }
};