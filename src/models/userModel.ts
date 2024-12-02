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

interface UserRow {
    [key: string]: any;
}

const _findUser = async (column: string, value: any): Promise<User | null> => {
    const result = await pool.query(
        `
        SELECT u.*,
            COALESCE(SUM(CASE WHEN c.is_monthly THEN c.amount ELSE 0 END), 0) AS monthly_contribution,
            COALESCE(SUM(c.amount), 0) AS total_contribution
        FROM users u
        LEFT JOIN contributions c ON u.id = c.user_id
        WHERE u.${column} = $1
        GROUP BY u.id
        `,
        [value]
    );

    if (result.rows.length > 0) {
        const row: UserRow = result.rows[0];
        const user = snakeToCamel(row) as User;
        user.monthlyContribution = parseFloat(user.monthlyContribution as any) || 0;
        user.totalContribution = parseFloat(user.totalContribution as any) || 0;
        return user;
    } else {
        return null;
    }
};

export const findUserById = async (id: number): Promise<User | null> => {
    return await _findUser('id', id);
};

export const findUserByPhoneNumber = async (phoneNumber: string): Promise<User | null> => {
    return await _findUser('phone_number', phoneNumber);
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

export const deleteUserById = async (id: number): Promise<void> => {
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [id]);
};

export interface PlatformUser {
    id: number;
    name: string | null;
    image: string | null;
}

export interface UserSupportSummary {
    count: number;
    user: PlatformUser;
}

export const getUsersByNeighborhoodWithSupportCount = async (
    neighborhoodId: number,
    excludeUserId?: number
): Promise<UserSupportSummary[]> => {
    const query = `
        SELECT u.id,
               u.first_name,
               u.last_name,
               u.photo_url,
               COUNT(s.id) AS support_count
        FROM users u
        LEFT JOIN supports s ON u.id = s.user_id
        WHERE u.neighborhood_id = $1
        ${excludeUserId ? 'AND u.id != $2' : ''}
        GROUP BY u.id, u.first_name, u.last_name, u.photo_url
    `;
    const values = excludeUserId ? [neighborhoodId, excludeUserId] : [neighborhoodId];

    const result = await pool.query(query, values);

    const userSupportSummaries = result.rows.map((row) => {
        const lastInitial = row.last_name ? row.last_name.charAt(0) : '';
        const name = `${row.first_name} ${lastInitial}`.trim();

        const user: PlatformUser = {
            id: row.id,
            name: name || null,
            image: row.photo_url || null,
        };

        const userSupportSummary: UserSupportSummary = {
            count: parseInt(row.support_count, 10) || 0,
            user,
        };

        return userSupportSummary;
    });

    return userSupportSummaries;
};