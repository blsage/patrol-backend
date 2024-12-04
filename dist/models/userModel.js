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
exports.getUsersWithContributionSummaries = exports.getUsersByNeighborhoodWithSupportCount = exports.deleteUserById = exports.updateUserById = exports.findUserByPhoneNumber = exports.findUserById = void 0;
const db_1 = __importDefault(require("../db/db"));
const caseConverter_1 = require("../utils/caseConverter");
const _findUser = (column, value) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_1.default.query(`
        SELECT u.*,
            COALESCE(SUM(CASE WHEN c.is_monthly THEN c.amount ELSE 0 END), 0) AS monthly_contribution,
            COALESCE(SUM(c.amount), 0) AS total_contribution
        FROM users u
        LEFT JOIN contributions c ON u.id = c.user_id
        WHERE u.${column} = $1
        GROUP BY u.id
        `, [value]);
    if (result.rows.length > 0) {
        const row = result.rows[0];
        const user = (0, caseConverter_1.snakeToCamel)(row);
        user.monthlyContribution = parseFloat(user.monthlyContribution) || 0;
        user.totalContribution = parseFloat(user.totalContribution) || 0;
        return user;
    }
    else {
        return null;
    }
});
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield _findUser('id', id);
});
exports.findUserById = findUserById;
const findUserByPhoneNumber = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    return yield _findUser('phone_number', phoneNumber);
});
exports.findUserByPhoneNumber = findUserByPhoneNumber;
const updateUserById = (id, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const snakeUserData = (0, caseConverter_1.camelToSnake)(userData);
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
    yield db_1.default.query(query, values);
});
exports.updateUserById = updateUserById;
const deleteUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'DELETE FROM users WHERE id = $1';
    yield db_1.default.query(query, [id]);
});
exports.deleteUserById = deleteUserById;
const getUsersByNeighborhoodWithSupportCount = (neighborhoodId, excludeUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
        SELECT u.id,
               u.first_name,
               u.last_name,
               u.photo_url,
               COUNT(s.id) AS support_count,
               MAX(s.created_at) AS latest_support_date
        FROM users u
        LEFT JOIN supports s ON u.id = s.user_id
        WHERE u.neighborhood_id = $1
        ${excludeUserId ? 'AND u.id != $2' : ''}
        GROUP BY u.id, u.first_name, u.last_name, u.photo_url
        ORDER BY latest_support_date DESC NULLS LAST
    `;
    const values = excludeUserId ? [neighborhoodId, excludeUserId] : [neighborhoodId];
    const result = yield db_1.default.query(query, values);
    const userSupportSummaries = result.rows.map((row) => {
        const lastInitial = row.last_name ? row.last_name.charAt(0) : '';
        const name = `${row.first_name} ${lastInitial}`.trim();
        const user = {
            id: row.id,
            name: name || null,
            image: row.photo_url || null,
        };
        const userSupportSummary = {
            count: parseInt(row.support_count, 10) || 0,
            user,
        };
        return userSupportSummary;
    });
    return userSupportSummaries;
});
exports.getUsersByNeighborhoodWithSupportCount = getUsersByNeighborhoodWithSupportCount;
const getUsersWithContributionSummaries = (neighborhoodId, excludeUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const values = [neighborhoodId];
    if (excludeUserId) {
        values.push(excludeUserId);
    }
    const query = `
        SELECT u.id,
               u.first_name,
               u.last_name,
               u.photo_url,
               MAX(c.created_at) AS latest_contribution_date,
               SUM(c.amount) AS total_contribution_amount,
               SUM(
                   CASE WHEN c.created_at >= NOW() - INTERVAL '30 days' THEN c.amount ELSE 0 END
               ) AS last_30_days_contribution_amount,
               SUM(c.like_count) AS total_like_count
        FROM users u
        JOIN contributions c ON u.id = c.user_id
        WHERE u.neighborhood_id = $1
          AND c.neighborhood_id = $1
          ${excludeUserId ? 'AND u.id != $2' : ''}
        GROUP BY u.id, u.first_name, u.last_name, u.photo_url
        ORDER BY latest_contribution_date DESC
    `;
    const result = yield db_1.default.query(query, values);
    const userContributionSummaries = result.rows.map((row) => {
        const lastInitial = row.last_name ? row.last_name.charAt(0) : '';
        const name = `${row.first_name} ${lastInitial}`.trim();
        const user = {
            id: row.id,
            name: name || null,
            image: row.photo_url || null,
        };
        const userContributionSummary = {
            total: parseInt(row.total_contribution_amount, 10) || 0,
            last30: parseInt(row.last_30_days_contribution_amount, 10) || 0,
            likes: parseInt(row.total_like_count, 10) || 0,
            user,
        };
        return userContributionSummary;
    });
    return userContributionSummaries;
});
exports.getUsersWithContributionSummaries = getUsersWithContributionSummaries;
