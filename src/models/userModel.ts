import pool from '../db/db';
import { camelToSnake, snakeToCamel } from '../utils/caseConverter';

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
            COALESCE(SUM(CASE WHEN c.is_monthly THEN c.amount ELSE 0 END), 0) AS monthly_contribution,
            COALESCE(SUM(c.amount), 0) AS total_contribution
        FROM users u
        LEFT JOIN contributions c ON u.id = c.user_id
        WHERE u.id = $1
        GROUP BY u.id
        `,
        [id]
    );

    if (result.rows.length > 0) {
        const row = result.rows[0];
        const user = snakeToCamel(row) as User;
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
        const user = snakeToCamel(row) as User;
        return user;
    } else {
        return null;
    }
};

export const updateUserById = async (id: number, userData: Partial<User>): Promise<void> => {
    const snakeUserData = camelToSnake(userData) as { [key: string]: any };
    const fields = [];
    const values = [];
    let index = 1;

    const keys = Object.keys(snakeUserData);

    for (const key of keys) {
        if (snakeUserData[key] !== undefined) {
            fields.push(`${key} = $${index}`);
            values.push(snakeUserData[key]);
            index++;
        }
    }

    if (fields.length === 0) {
        throw new Error('No valid fields to update.');
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${index}`;
    await pool.query(query, values);
};