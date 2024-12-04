import pool from '../db/db';

export interface NeighborhoodSummary {
    name: string;
    totalRaised: number;
    contributors: number;
}

export const getNeighborhoodSummary = async (
    neighborhoodId: number
): Promise<NeighborhoodSummary | null> => {
    const query = `
        SELECT
            n.name,
            COALESCE(SUM(c.amount), 0) AS total_raised,
            COUNT(DISTINCT c.user_id) AS contributors
        FROM neighborhoods n
        LEFT JOIN contributions c ON n.id = c.neighborhood_id
        WHERE n.id = $1
        GROUP BY n.id, n.name
    `;

    const result = await pool.query(query, [neighborhoodId]);

    if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
            name: row.name,
            totalRaised: parseFloat(row.total_raised) || 0,
            contributors: parseInt(row.contributors, 10) || 0,
        };
    } else {
        return null;
    }
};