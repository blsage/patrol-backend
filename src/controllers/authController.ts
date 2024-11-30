import { Request, Response } from 'express';
import { sendVerificationCode, verifyCode } from '../services/smsService';
import { findUserByPhoneNumber } from '../models/userModel';
import jwt from 'jsonwebtoken';
import { showError } from '../utils/errorUtils';
import { formatPhoneNumber } from '../utils/phoneUtils';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const sendCode = async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        showError(res, 400, 'Phone number is required.');
        return;
    }

    try {
        const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

        await sendVerificationCode(formattedPhoneNumber);

        res.status(200).json({ message: 'Verification code sent.' });
    } catch (error) {
        const errorMessage = (error as Error).message || 'Failed to send verification code.';
        showError(res, 400, errorMessage);
    }
};

export const verifyCodeEndpoint = async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
        showError(res, 400, 'Phone number and code are required.');
        return;
    }

    try {
        const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

        const isVerified = await verifyCode(formattedPhoneNumber, code);

        if (isVerified) {
            const user = await findUserByPhoneNumber(formattedPhoneNumber);

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
                const token = jwt.sign({ phoneNumber: formattedPhoneNumber }, JWT_SECRET, {
                    expiresIn: '15m',
                });

                res.status(200).json({
                    message: 'Phone number verified. User does not exist.',
                    token,
                });
            }
        } else {
            showError(res, 400, 'Invalid verification code.');
        }
    } catch (error) {
        const errorMessage = (error as Error).message || 'Failed to verify code.';
        showError(res, 400, errorMessage);
    }
};
