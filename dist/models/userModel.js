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
exports.updateUserById = exports.findUserByPhoneNumber = exports.findUserById = void 0;
const db_1 = __importDefault(require("../db/db"));
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_1.default.query(`
        SELECT u.*,
            COALESCE(SUM(CASE WHEN c.is_monthly THEN c.amount ELSE 0 END), 0) AS "monthlyContribution",
            COALESCE(SUM(c.amount), 0) AS "totalContribution"
        FROM users u
        LEFT JOIN contributions c ON u.id = c.user_id
        WHERE u.id = $1
        GROUP BY u.id
        `, [id]);
    if (result.rows.length > 0) {
        const row = result.rows[0];
        const user = {
            id: row.id,
            phoneNumber: row.phone_number,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            title: row.title,
            neighborhoodId: row.neighborhood_id,
            photoUrl: row.photo_url,
            monthlyContribution: parseFloat(row.monthlyContribution) || 0,
            totalContribution: parseFloat(row.totalContribution) || 0,
        };
        return user;
    }
    else {
        return null;
    }
});
exports.findUserById = findUserById;
const findUserByPhoneNumber = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_1.default.query(`
        SELECT u.*,
            COALESCE(SUM(CASE WHEN c.is_monthly THEN c.amount ELSE 0 END), 0) AS "monthlyContribution",
            COALESCE(SUM(c.amount), 0) AS "totalContribution"
        FROM users u
        LEFT JOIN contributions c ON u.id = c.user_id
        WHERE u.phone_number = $1
        GROUP BY u.id
        `, [phoneNumber]);
    if (result.rows.length > 0) {
        const row = result.rows[0];
        const user = {
            id: row.id,
            phoneNumber: row.phone_number,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            title: row.title,
            neighborhoodId: row.neighborhood_id,
            photoUrl: row.photo_url,
            monthlyContribution: parseFloat(row.monthlyContribution) || 0,
            totalContribution: parseFloat(row.totalContribution) || 0,
        };
        return user;
    }
    else {
        return null;
    }
});
exports.findUserByPhoneNumber = findUserByPhoneNumber;
const updateUserById = (id, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const fields = [];
    const values = [];
    let index = 1;
    const keys = Object.keys(userData);
    for (const key of keys) {
        if (userData[key] !== undefined) {
            fields.push(`${key} = $${index}`);
            values.push(userData[key]);
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
