import pool from '../db/db';

export interface Support {
    id: number;
    userId: number;
    neighborhoodId: number;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

export const createSupportEntry = async (
    userId: number,
    neighborhoodId: number
): Promise<Support> => {
    const query = `
        INSERT INTO supports (user_id, neighborhood_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const values = [userId, neighborhoodId];

    const result = await pool.query(query, values);

    const support = result.rows[0];

    return {
        id: support.id,
        userId: support.user_id,
        neighborhoodId: support.neighborhood_id,
        timestamp: support.timestamp,
        createdAt: support.created_at,
        updatedAt: support.updated_at,
    };
};