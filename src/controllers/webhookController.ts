import { Request, Response } from 'express';
import Stripe from 'stripe';
import { createContributionEntry } from '../models/contributionModel';
import { findUserById } from '../models/userModel';
import { showError } from '../utils/errorUtils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-11-20.acacia',
});

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Error verifying Stripe webhook signature:', err);
        showError(res, 400, `Webhook Error: ${(err as Error).message}`);
        return;
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            const userId = parseInt(paymentIntent.metadata.userId, 10);
            const isMonthly = paymentIntent.metadata.isMonthly === 'true';
            const amount = paymentIntent.amount;

            try {
                const user = await findUserById(userId);

                if (!user) {
                    console.error('User not found:', userId);
                    break;
                }

                await createContributionEntry({
                    userId: user.id,
                    neighborhoodId: user.neighborhoodId,
                    amount,
                    isMonthly,
                });

                console.log('Contribution recorded for user:', userId);
            } catch (error) {
                console.error('Error creating contribution entry:', error);
            }

            break;
        default:
            console.warn(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
};