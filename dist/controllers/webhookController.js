"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const stripe_1 = __importDefault(require("stripe"));
const contributionModel_1 = require("../models/contributionModel");
const userModel_1 = require("../models/userModel");
const errorUtils_1 = require("../utils/errorUtils");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
});
const handleStripeWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
    catch (err) {
        console.error('Error verifying Stripe webhook signature:', err);
        (0, errorUtils_1.showError)(res, 400, `Webhook Error: ${err.message}`);
        return;
    }
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            const userId = parseInt(paymentIntent.metadata.userId, 10);
            const isMonthly = paymentIntent.metadata.isMonthly === 'true';
            const amount = paymentIntent.amount;
            try {
                const user = yield (0, userModel_1.findUserById)(userId);
                if (!user) {
                    console.error('User not found:', userId);
                    break;
                }
                yield (0, contributionModel_1.createContributionEntry)({
                    userId: user.id,
                    neighborhoodId: user.neighborhoodId,
                    amount,
                    isMonthly,
                });
                console.log('Contribution recorded for user:', userId);
            }
            catch (error) {
                console.error('Error creating contribution entry:', error);
            }
            break;
        default:
            console.warn(`Unhandled event type: ${event.type}`);
    }
    res.json({ received: true });
});
exports.handleStripeWebhook = handleStripeWebhook;
