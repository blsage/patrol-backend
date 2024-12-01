import { Response } from 'express';
import { findUserById, updateUserById, User } from '../models/userModel';
import pool from '../db/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { showError } from '../utils/errorUtils';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { camelToSnake, snakeToCamel } from '../utils/caseConverter';

export const createUser = async ({ body: userData }: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (userData.phoneNumber) {
            userData.phoneNumber = formatPhoneNumber(userData.phoneNumber);
        }

        const snakeUserData = camelToSnake(userData);
        const fields = Object.keys(snakeUserData).join(', ');
        const placeholders = Object.keys(snakeUserData).map((_, index) => `$${index + 1}`).join(', ');
        const values = Object.values(snakeUserData);

        const query = `INSERT INTO users (${fields}) VALUES (${placeholders}) RETURNING *`;
        const result = await pool.query(query, values);

        const user = snakeToCamel(result.rows[0]) as User;

        res.status(201).json({
            message: 'User created successfully.',
            user,
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