"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
const caseConverter_1 = require("../utils/caseConverter");
const populateSupports = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve all users
        const usersResult = yield db_1.default.query('SELECT * FROM users');
        const users = usersResult.rows.map(row => (0, caseConverter_1.snakeToCamel)(row));
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
        yield db_1.default.query('BEGIN');
        for (const user of users) {
            const supportCount = getRandomSupportCount();
            // Insert the supports for the user
            for (let i = 0; i < supportCount; i++) {
                yield db_1.default.query('INSERT INTO supports (user_id, neighborhood_id) VALUES ($1, $2)', [user.id, user.neighborhoodId]);
            }
        }
        // Commit transaction
        yield db_1.default.query('COMMIT');
        console.log('Successfully populated supports for users.');
    }
    catch (error) {
        // Rollback transaction in case of error
        yield db_1.default.query('ROLLBACK');
        console.error('Error populating supports:', error);
    }
    finally {
        // End the pool to free up resources
        yield db_1.default.end();
    }
});
populateSupports();
