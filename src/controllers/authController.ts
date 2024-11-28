import { Request, Response } from 'express';
import { sendVerificationCode, verifyCode } from '../services/smsService';

export const sendCode = async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        res.status(400).json({ message: 'Phone number is required.' });
        return;
    }

    try {
        await sendVerificationCode(phoneNumber);
        res.status(200).json({ message: 'Verification code sent.' });
    } catch (error) {
        console.error('Error sending verification code:', error as Error);
        res.status(400).json({ message: (error as Error).message || 'Failed to send verification code.' });
    }
};

export const verifyCodeEndpoint = async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
        res.status(400).json({ message: 'Phone number and code are required.' });
        return;
    }

    try {
        const isVerified = await verifyCode(phoneNumber, code);

        if (isVerified) {
            res.status(200).json({ message: 'Phone number verified.' });
        } else {
            res.status(400).json({ message: 'Invalid verification code.' });
        }
    } catch (error) {
        console.error('Error verifying code:', error as Error);
        res.status(400).json({ message: (error as Error).message || 'Failed to verify code.' });
    }
};