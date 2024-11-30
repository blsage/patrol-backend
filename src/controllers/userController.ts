import { Response } from 'express';
import { findUserByPhoneNumber, User } from '../models/userModel';
import jwt from 'jsonwebtoken';
import pool from '../db/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { showError } from '../utils/errorUtils';
import { formatPhoneNumber } from '../utils/phoneUtils';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { email, first, last, title, phone, neighborhoodId, photoUrl } = req.body;

    if (!email || !first || !last || !title || !phone) {
        showError(res, 400, 'Email, first name, last name, title, and phone are required.');
        return;
    }

    try {
        const formattedPhone = formatPhoneNumber(phone);
        const userExists = await findUserByPhoneNumber(formattedPhone);

        if (userExists) {
            showError(res, 400, 'User already exists.');
            return;
        }

        const result = await pool.query(
            'INSERT INTO users (phone_number, email, first_name, last_name, title, neighborhood_id, photo_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [formattedPhone, email, first, last, title, neighborhoodId, photoUrl]
        );

        const user = result.rows[0] as User;

        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: '360d',
        });

        res.status(201).json({
            message: 'User created successfully.',
            user,
            token,
        });
    } catch (error) {
        const errorMessage = (error as Error).message || 'Failed to create user.';
        showError(res, 400, errorMessage);
    }
};