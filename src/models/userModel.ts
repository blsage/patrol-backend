import pool from '../db/db';

export interface User {
    id: number;
    phoneNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    title: string;
    neighborhoodId: number;
    photoUrl: string | null;
    monthlyContribution: number;
    totalContribution: number;
}

export const findUserById = async (id: number): Promise<User | null> => {
    const result = await pool.query(
        `
        SELECT u.*,
            COALESCE(SUM(CASE WHEN c.is_monthly THEN c.amount ELSE 0 END), 0) AS "monthlyContribution",
            COALESCE(SUM(c.amount), 0) AS "totalContribution"
        FROM users u
        LEFT JOIN contributions c ON u.id = c.user_id
        WHERE u.id = $1
        GROUP BY u.id
        `,
        [id]
    );

    if (result.rows.length > 0) {
        const row = result.rows[0];
        const user: User = {
            id: row.id,
            phoneNumber: row.phone_number,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            title: row.title,
            neighborhoodId: row.neighborhood_id,
            photoUrl: row.photo_url,
            monthlyContribution: parseFloat(row.monthlyContribution) || 0,
            totalContribution: parseFloat(row.totalContribution) || 0,
        };
        return user;
    } else {
        return null;
    }
};

export const findUserByPhoneNumber = async (phoneNumber: string): Promise<User | null> => {
    const result = await pool.query(
        `
        SELECT u.*,
            COALESCE(SUM(CASE WHEN c.is_monthly THEN c.amount ELSE 0 END), 0) AS "monthlyContribution",
            COALESCE(SUM(c.amount), 0) AS "totalContribution"
        FROM users u
        LEFT JOIN contributions c ON u.id = c.user_id
        WHERE u.phone_number = $1
        GROUP BY u.id
        `,
        [phoneNumber]
    );

    if (result.rows.length > 0) {
        const row = result.rows[0];
        const user: User = {
            id: row.id,
            phoneNumber: row.phone_number,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            title: row.title,
            neighborhoodId: row.neighborhood_id,
            photoUrl: row.photo_url,
            monthlyContribution: parseFloat(row.monthlyContribution) || 0,
            totalContribution: parseFloat(row.totalContribution) || 0,
        };
        return user;
    } else {
        return null;
    }
};
