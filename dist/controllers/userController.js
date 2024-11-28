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
exports.createUser = void 0;
const userModel_1 = require("../models/userModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db/db"));
const JWT_SECRET = process.env.JWT_SECRET;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, firstName, lastName, title } = req.body;
    const phoneNumber = (_a = req.user) === null || _a === void 0 ? void 0 : _a.phoneNumber;
    if (!phoneNumber) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!email || !firstName || !lastName || !title) {
        res.status(400).json({ message: 'Email, firstName, lastName, and title are required.' });
        return;
    }
    try {
        const userExists = yield (0, userModel_1.findUserByPhoneNumber)(phoneNumber);
        if (userExists) {
            res.status(400).json({ message: 'User already exists.' });
            return;
        }
        const result = yield db_1.default.query('INSERT INTO users (phone_number, email, first_name, last_name, title) VALUES ($1, $2, $3, $4, $5) RETURNING *', [phoneNumber, email, firstName, lastName, title]);
        const user = result.rows[0];
        const token = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: '1h',
        });
        res.status(201).json({
            message: 'User created successfully.',
            user,
            token,
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ message: error.message || 'Failed to create user.' });
    }
});
exports.createUser = createUser;
