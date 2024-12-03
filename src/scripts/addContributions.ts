import pool from '../db/db';
import { QueryResult } from 'pg';

function getRandomInt(min: number, max: number): number {
    // Inclusive of min and max
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomAmount(min: number, max: number): number {
    // Non-linear distribution favoring smaller amounts
    const r = Math.random();
    const amount = min + (max - min) * Math.pow(r, 3); // Adjust exponent to control skewness
    return amount;
}

(async () => {
    try {
        // Fetch all users
        const usersResult: QueryResult = await pool.query('SELECT id, neighborhood_id FROM users');
        const users = usersResult.rows;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        for (const user of users) {
            // Decide whether to create 1 or 2 contributions
            const contributionsCount = getRandomInt(1, 2);

            for (let i = 0; i < contributionsCount; i++) {
                // Generate amount
                let amount = getRandomAmount(10, 50000);

                // Round amounts
                if (amount > 100) {
                    amount = Math.round(amount / 100) * 100;
                } else {
                    amount = Math.round(amount / 10) * 10;
                }

                // Ensure amount is at least $10 and not zero
                amount = Math.max(amount, 10);

                // Insert contribution
                await pool.query(
                    `INSERT INTO contributions (user_id, neighborhood_id, amount, is_monthly, created_at, updated_at, like_count)
                     VALUES ($1, $2, $3, true, $4, $4, 0)`,
                    [user.id, user.neighborhood_id, amount, yesterday]
                );
            }
        }

        console.log('Contributions added successfully.');
        process.exit(0);
    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    }
})();