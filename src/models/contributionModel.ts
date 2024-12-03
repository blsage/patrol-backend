import pool from '../db/db';

export interface Contribution {
    id?: number;
    userId: number;
    neighborhoodId: number;
    amount: number;
    isMonthly: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    likeCount?: number;
}

export const createContributionEntry = async (contribution: Contribution): Promise<Contribution> => {
    const query = `
    INSERT INTO contributions (user_id, neighborhood_id, amount, is_monthly)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
    const values = [
        contribution.userId,
        contribution.neighborhoodId,
        contribution.amount,
        contribution.isMonthly,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};