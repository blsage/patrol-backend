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
exports.verifyCodeEndpoint = exports.sendCode = void 0;
const smsService_1 = require("../services/smsService");
const userModel_1 = require("../models/userModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const sendCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        res.status(400).json({ message: 'Phone number is required.' });
        return;
    }
    try {
        yield (0, smsService_1.sendVerificationCode)(phoneNumber);
        res.status(200).json({ message: 'Verification code sent.' });
    }
    catch (error) {
        console.error('Error sending verification code:', error);
        res.status(400).json({ message: error.message || 'Failed to send verification code.' });
    }
});
exports.sendCode = sendCode;
const verifyCodeEndpoint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, code } = req.body;
    if (!phoneNumber || !code) {
        res.status(400).json({ message: 'Phone number and code are required.' });
        return;
    }
    try {
        const isVerified = yield (0, smsService_1.verifyCode)(phoneNumber, code);
        if (isVerified) {
            const user = yield (0, userModel_1.findUserByPhoneNumber)(phoneNumber);
            if (user) {
                const token = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, {
                    expiresIn: '365d',
                });
                res.status(200).json({
                    message: 'Phone number verified.',
                    user,
                    token,
                });
            }
            else {
                const token = jsonwebtoken_1.default.sign({ phoneNumber }, JWT_SECRET, {
                    expiresIn: '15m',
                });
                res.status(200).json({
                    message: 'Phone number verified. User does not exist.',
                    token,
                });
            }
        }
        else {
            res.status(400).json({ message: 'Invalid verification code.' });
        }
    }
    catch (error) {
        console.error('Error verifying code:', error);
        res.status(400).json({ message: error.message || 'Failed to verify code.' });
    }
});
exports.verifyCodeEndpoint = verifyCodeEndpoint;
