import { Response } from 'express';
import { findUserByPhoneNumber, User } from '../models/userModel';
import jwt from 'jsonwebtoken';
import pool from '../db/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { email, firstName, lastName, title, neighborhoodId, photoUrl } = req.body;
    const phoneNumber = req.user?.phoneNumber;

    if (!phoneNumber) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    if (!email || !firstName || !lastName || !title) {
        res.status(400).json({ message: 'Email, firstName, lastName, and title are required.' });
        return;
    }

    try {
        const userExists = await findUserByPhoneNumber(phoneNumber);

        if (userExists) {
            res.status(400).json({ message: 'User already exists.' });
            return;
        }

        const result = await pool.query(
            'INSERT INTO users (phone_number, email, first_name, last_name, title, neighborhood_id, photo_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [phoneNumber, email, firstName, lastName, title, neighborhoodId, photoUrl]
        );

        const user = result.rows[0] as User;

        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({
            message: 'User created successfully.',
            user,
            token,
        });
    } catch (error) {
        console.error('Error creating user:', error as Error);
        res.status(400).json({ message: (error as Error).message || 'Failed to create user.' });
    }
};