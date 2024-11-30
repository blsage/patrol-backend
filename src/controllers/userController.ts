import { Response } from 'express';
import { findUserById, findUserByPhoneNumber, updateUserById } from '../models/userModel';
import jwt from 'jsonwebtoken';
import pool from '../db/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { showError } from '../utils/errorUtils';
import { formatPhoneNumber } from '../utils/phoneUtils';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { email, first, last, title, phone, neighborhoodId, photoUrl } = req.body;

    if (!email || !first || !last || !title || !phone || !neighborhoodId) {
        showError(res, 400, 'Email, first name, last name, title, phone, and neighborhoodId are required.');
        return;
    }

    try {
        const formattedPhone = formatPhoneNumber(phone);
        const userExists = await findUserByPhoneNumber(formattedPhone);

        if (userExists) {
            showError(res, 400, 'User already exists.');
            return;
        }

        await pool.query(
            'INSERT INTO users (phone_number, email, first_name, last_name, title, neighborhood_id, photo_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [formattedPhone, email, first, last, title, neighborhoodId, photoUrl]
        );

        const user = await findUserByPhoneNumber(formattedPhone);
        if (!user) {
            showError(res, 500, 'Failed to retrieve user after creation.');
            return;
        }

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

export const getUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        showError(res, 401, 'Unauthorized');
        return;
    }

    try {
        const user = await findUserById(userId);

        if (!user) {
            showError(res, 404, 'User not found.');
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        const errorMessage = (error as Error).message || 'Failed to retrieve user.';
        showError(res, 500, errorMessage);
    }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        showError(res, 401, 'Unauthorized');
        return;
    }

    const allowedUpdates = [
        'email',
        'firstName',
        'lastName',
        'title',
        'phoneNumber',
        'neighborhoodId',
        'photoUrl',
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        showError(res, 400, 'Invalid updates!');
        return;
    }

    try {
        const user = await findUserById(userId);

        if (!user) {
            showError(res, 404, 'User not found.');
            return;
        }

        const updatedData: Partial<typeof user> = {};
        updates.forEach((update) => {
            updatedData[update as keyof typeof user] = req.body[update];
        });

        await updateUserById(userId, updatedData);
        const updatedUser = await findUserById(userId);

        res.status(200).json({
            message: 'User updated successfully.',
            user: updatedUser,
        });
    } catch (error) {
        const errorMessage = (error as Error).message || 'Failed to update user.';
        showError(res, 400, errorMessage);
    }
};