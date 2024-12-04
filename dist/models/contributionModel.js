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
exports.getContributionsWithUserInfo = exports.createContributionEntry = void 0;
const db_1 = __importDefault(require("../db/db"));
const createContributionEntry = (contribution) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    INSERT INTO contributions (user_id, neighborhood_id, amount, is_monthly)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
    const values = [
        contribution.userId,
        contribution.neighborhoodId,
        contribution.amount,
        contribution.isMonthly,
    ];
    const result = yield db_1.default.query(query, values);
    return result.rows[0];
});
exports.createContributionEntry = createContributionEntry;
const getContributionsWithUserInfo = (neighborhoodId, excludeUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const values = [neighborhoodId];
    if (excludeUserId) {
        values.push(excludeUserId);
    }
    const query = `
        SELECT
            c.id,
            c.amount,
            c.created_at,
            c.like_count,
            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.photo_url,
            CASE
                WHEN c.created_at >= NOW() - INTERVAL '30 days' THEN true
                ELSE false
            END AS last_30_days_contribution
        FROM contributions c
        JOIN users u ON c.user_id = u.id
        WHERE u.neighborhood_id = $1
          AND c.neighborhood_id = $1
          ${excludeUserId ? 'AND u.id != $2' : ''}
        ORDER BY c.created_at DESC
    `;
    const result = yield db_1.default.query(query, values);
    const contributions = result.rows.map((row) => {
        const lastInitial = row.last_name ? row.last_name.charAt(0) : '';
        const name = `${row.first_name} ${lastInitial}`.trim();
        const user = {
            id: row.user_id,
            name: name || null,
            image: row.photo_url || null,
        };
        const contribution = {
            id: row.id,
            amount: parseInt(row.amount, 10) || 0,
            createdAt: row.created_at,
            last30: row.last_30_days_contribution,
            likes: parseInt(row.like_count, 10) || 0,
            user,
        };
        return contribution;
    });
    return contributions;
});
exports.getContributionsWithUserInfo = getContributionsWithUserInfo;
