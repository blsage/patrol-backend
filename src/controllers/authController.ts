import { Request, Response } from 'express';
import { sendVerificationCode, verifyCode } from '../services/smsService';
import { findUserByPhoneNumber, User } from '../models/userModel';
import jwt from 'jsonwebtoken';
import pool from '../db/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

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
            const user = await findUserByPhoneNumber(phoneNumber);

            if (user) {
                const token = jwt.sign({ id: user.id }, JWT_SECRET, {
                    expiresIn: '365d',
                });

                res.status(200).json({
                    message: 'Phone number verified.',
                    user,
                    token,
                });
            } else {
                const token = jwt.sign({ phoneNumber }, JWT_SECRET, {
                    expiresIn: '15m',
                });

                res.status(200).json({
                    message: 'Phone number verified. User does not exist.',
                    token,
                });
            }
        } else {
            res.status(400).json({ message: 'Invalid verification code.' });
        }
    } catch (error) {
        console.error('Error verifying code:', error as Error);
        res.status(400).json({ message: (error as Error).message || 'Failed to verify code.' });
    }
};
