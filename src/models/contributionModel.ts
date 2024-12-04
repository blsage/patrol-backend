import pool from '../db/db';
import { PlatformUser } from './userModel';

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

export interface ContributionWithUser {
    id: number;
    amount: number;
    createdAt: Date;
    last30: boolean;
    likes: number;
    user: PlatformUser;
}

export const getContributionsWithUserInfo = async (
    neighborhoodId: number,
    excludeUserId?: number
): Promise<ContributionWithUser[]> => {
    const values = [neighborhoodId];

    if (excludeUserId) {
        values.push(excludeUserId);
    }

    const query = `
        SELECT
            c.id,
            c.amount,
            c.created_at,
            c.like_count,
            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.photo_url,
            CASE
                WHEN c.created_at >= NOW() - INTERVAL '30 days' THEN true
                ELSE false
            END AS last_30_days_contribution
        FROM contributions c
        JOIN users u ON c.user_id = u.id
        WHERE u.neighborhood_id = $1
          AND c.neighborhood_id = $1
          ${excludeUserId ? 'AND u.id != $2' : ''}
        ORDER BY c.created_at DESC
    `;

    const result = await pool.query(query, values);

    const contributions = result.rows.map((row) => {
        const lastInitial = row.last_name ? row.last_name.charAt(0) : '';
        const name = `${row.first_name} ${lastInitial}`.trim();

        const user: PlatformUser = {
            id: row.user_id,
            name: name || null,
            image: row.photo_url || null,
        };

        const contribution: ContributionWithUser = {
            id: row.id,
            amount: parseInt(row.amount, 10) || 0,
            createdAt: row.created_at,
            last30: row.last_30_days_contribution,
            likes: parseInt(row.like_count, 10) || 0,
            user,
        };

        return contribution;
    });

    return contributions;
};