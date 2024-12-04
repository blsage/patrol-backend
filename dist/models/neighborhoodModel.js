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
exports.getNeighborhoodSummary = void 0;
const db_1 = __importDefault(require("../db/db"));
const getNeighborhoodSummary = (neighborhoodId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
        SELECT
            n.name,
            COALESCE(SUM(c.amount), 0) AS total_raised,
            COUNT(DISTINCT c.user_id) AS contributors
        FROM neighborhoods n
        LEFT JOIN contributions c ON n.id = c.neighborhood_id
        WHERE n.id = $1
        GROUP BY n.id, n.name
    `;
    const result = yield db_1.default.query(query, [neighborhoodId]);
    if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
            name: row.name,
            totalRaised: parseFloat(row.total_raised) || 0,
            contributors: parseInt(row.contributors, 10) || 0,
        };
    }
    else {
        return null;
    }
});
exports.getNeighborhoodSummary = getNeighborhoodSummary;
