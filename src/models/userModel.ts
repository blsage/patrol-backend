import pool from '../db/db';

export interface User {
    id: number;
    phone_number: string;
    email: string;
    first_name: string;
    last_name: string;
    title: string;
}

export const findUserByPhoneNumber = async (phoneNumber: string): Promise<User | null> => {
    const result = await pool.query(
        'SELECT * FROM users WHERE phone_number = $1',
        [phoneNumber]
    );
    if (result.rows.length > 0) {
        return result.rows[0] as User;
    } else {
        return null;
    }
};
