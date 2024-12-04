import pool from '../db/db';
import { QueryResult } from 'pg';

async function addRandomLikesToContributions(): Promise<void> {
    try {
        // Fetch all contributions
        const contributionsResult: QueryResult = await pool.query('SELECT id, user_id FROM contributions');
        const contributions = contributionsResult.rows;

        // Fetch all users
        const usersResult: QueryResult = await pool.query('SELECT id FROM users');
        const users = usersResult.rows.map(row => row.id);

        for (const contribution of contributions) {
            // Decide whether to add a like with a 20% probability
            if (Math.random() < 0.2) {
                // Filter out the user who made the contribution
                const otherUsers = users.filter(id => id !== contribution.user_id);

                if (otherUsers.length > 0) {
                    // Pick a random user to like the contribution
                    const randomUserId = otherUsers[Math.floor(Math.random() * otherUsers.length)];

                    // Insert like into likes table
                    await pool.query(
                        `INSERT INTO likes (user_id, entity_type, entity_id)
                         VALUES ($1, 'contribution', $2)`,
                        [randomUserId, contribution.id]
                    );
                }
            }
        }

        console.log('Random likes added successfully.');
        process.exit(0);
    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    }
}

addRandomLikesToContributions();