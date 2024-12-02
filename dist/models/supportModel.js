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
exports.createSupportEntry = void 0;
const db_1 = __importDefault(require("../db/db"));
const createSupportEntry = (userId, neighborhoodId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
        INSERT INTO supports (user_id, neighborhood_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const values = [userId, neighborhoodId];
    const result = yield db_1.default.query(query, values);
    const support = result.rows[0];
    return {
        id: support.id,
        userId: support.user_id,
        neighborhoodId: support.neighborhood_id,
        timestamp: support.timestamp,
        createdAt: support.created_at,
        updatedAt: support.updated_at,
    };
});
exports.createSupportEntry = createSupportEntry;
