import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createSupportEntry } from '../models/supportModel';
import { findUserById } from '../models/userModel';
import { showError } from '../utils/errorUtils';

export const createSupport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

        const neighborhoodId = user.neighborhoodId;

        const support = await createSupportEntry(userId, neighborhoodId);

        res.status(201).json(support);
    } catch (error) {
        const errorMessage = (error as Error).message || 'Failed to create support.';
        showError(res, 500, errorMessage);
    }
};