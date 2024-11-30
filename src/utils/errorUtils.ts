import { Response } from 'express';

export const showError = (res: Response, statusCode: number, message: string): void => {
    console.error(`Status Code: ${statusCode}, Message: ${message}`);
    res.status(statusCode).json({ message });
};