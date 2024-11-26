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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCodeEndpoint = exports.sendCode = void 0;
const smsService_1 = require("../services/smsService");
const sendCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        next(error);
    }
});
exports.sendCode = sendCode;
const verifyCodeEndpoint = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, code } = req.body;
    if (!phoneNumber || !code) {
        res.status(400).json({ message: 'Phone number and code are required.' });
        return;
    }
    try {
        const isVerified = yield (0, smsService_1.verifyCode)(phoneNumber, code);
        if (isVerified) {
            res.status(200).json({ message: 'Phone number verified.' });
        }
        else {
            res.status(400).json({ message: 'Invalid verification code.' });
        }
    }
    catch (error) {
        console.error('Error verifying code:', error);
        next(error);
    }
});
exports.verifyCodeEndpoint = verifyCodeEndpoint;
