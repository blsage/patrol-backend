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
function addRandomLikesToContributions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch all contributions
            const contributionsResult = yield db_1.default.query('SELECT id, user_id FROM contributions');
            const contributions = contributionsResult.rows;
            // Fetch all users
            const usersResult = yield db_1.default.query('SELECT id FROM users');
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
                        yield db_1.default.query(`INSERT INTO likes (user_id, entity_type, entity_id)
                         VALUES ($1, 'contribution', $2)`, [randomUserId, contribution.id]);
                    }
                }
            }
            console.log('Random likes added successfully.');
            process.exit(0);
        }
        catch (error) {
            console.error('An error occurred:', error);
            process.exit(1);
        }
    });
}
addRandomLikesToContributions();
