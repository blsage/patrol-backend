import pool from '../db/db';
import { User } from '../models/userModel';
import { snakeToCamel } from '../utils/caseConverter';

const populateSupports = async (): Promise<void> => {
    try {
        // Retrieve all users
        const usersResult = await pool.query('SELECT * FROM users');
        const users: User[] = usersResult.rows.map(row => snakeToCamel(row) as User);

        // Define the support counts and their unnormalized probabilities
        const supportCounts = [0, 1, 2, 3, 4, 5];
        const probabilities = [1, 0.5, 1 / 3, 0.25, 0.2, 1 / 6];

        // Normalize the probabilities
        const totalProbability = probabilities.reduce((sum, p) => sum + p, 0);
        const normalizedProbabilities = probabilities.map(p => p / totalProbability);

        // Function to get a random support count based on the distribution
        const getRandomSupportCount = () => {
            const rand = Math.random();
            let cumulative = 0;
            for (let i = 0; i < supportCounts.length; i++) {
                cumulative += normalizedProbabilities[i];
                if (rand < cumulative) {
                    return supportCounts[i];
                }
            }
            return supportCounts[supportCounts.length - 1];
        };

        // Begin transaction
        await pool.query('BEGIN');

        for (const user of users) {
            const supportCount = getRandomSupportCount();

            // Insert the supports for the user
            for (let i = 0; i < supportCount; i++) {
                await pool.query(
                    'INSERT INTO supports (user_id, neighborhood_id) VALUES ($1, $2)',
                    [user.id, user.neighborhoodId]
                );
            }
        }

        // Commit transaction
        await pool.query('COMMIT');

        console.log('Successfully populated supports for users.');
    } catch (error) {
        // Rollback transaction in case of error
        await pool.query('ROLLBACK');
        console.error('Error populating supports:', error);
    } finally {
        // End the pool to free up resources
        await pool.end();
    }
};

populateSupports();