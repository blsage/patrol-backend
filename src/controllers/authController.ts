import { Request, Response } from 'express';
import { sendVerificationCode, verifyCode } from '../services/smsService';

export const sendCode = async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required.' });
    }

    try {
        await sendVerificationCode(phoneNumber);
        res.status(200).json({ message: 'Verification code sent.' });
    } catch (error) {
        console.error('Error sending verification code:', error);
        res.status(500).json({ message: 'Failed to send verification code.' });
    }
};

export const verifyCodeEndpoint = async (req: Request, res: Response) => {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
        return res.status(400).json({ message: 'Phone number and code are required.' });
    }

    try {
        const isVerified = await verifyCode(phoneNumber, code);

        if (isVerified) {
            res.status(200).json({ message: 'Phone number verified.' });
        } else {
            res.status(400).json({ message: 'Invalid verification code.' });
        }
    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({ message: 'Failed to verify code.' });
    }
};