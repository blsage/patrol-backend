import { Request, Response } from 'express';
import { getNeighborhoodSummary as getSummary } from '../models/neighborhoodModel';
import { showError } from '../utils/errorUtils';

export const getNeighborhoodSummary = async (req: Request, res: Response): Promise<void> => {
    const neighborhoodId = parseInt(req.params.id, 10);

    if (isNaN(neighborhoodId)) {
        showError(res, 400, 'Invalid Neighborhood ID.');
        return;
    }

    try {
        const summary = await getSummary(neighborhoodId);

        if (!summary) {
            showError(res, 404, 'Neighborhood not found.');
            return;
        }

        res.status(200).json(summary);
    } catch (error) {
        const errorMessage = (error as Error).message || 'Failed to retrieve neighborhood summary.';
        showError(res, 500, errorMessage);
    }
};