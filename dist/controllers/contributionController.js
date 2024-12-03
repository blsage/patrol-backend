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
exports.createContribution = void 0;
const stripe_1 = __importDefault(require("stripe"));
const errorUtils_1 = require("../utils/errorUtils");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-08-16',
});
const createContribution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, errorUtils_1.showError)(res, 401, 'Unauthorized');
        return;
    }
    const { amount, isMonthly } = req.body;
    if (!amount || typeof amount !== 'number') {
        (0, errorUtils_1.showError)(res, 400, 'Invalid amount.');
        return;
    }
    try {
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            metadata: {
                userId: userId.toString(),
                isMonthly: isMonthly ? 'true' : 'false',
            },
        });
        res.status(200).json(paymentIntent.client_secret);
    }
    catch (error) {
        console.error('Error creating payment intent:', error);
        (0, errorUtils_1.showError)(res, 500, 'Failed to create payment intent.');
    }
});
exports.createContribution = createContribution;
