import pool from '../db/db';

export interface User {
    id: number;
    phoneNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    title: string;
    neighborhoodId: number | null;
    photoUrl: string | null;
}

export const findUserByPhoneNumber = async (phoneNumber: string): Promise<User | null> => {
    const result = await pool.query(
        'SELECT * FROM users WHERE phone_number = $1',
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
        };
        return user;
    } else {
        return null;
    }
};
