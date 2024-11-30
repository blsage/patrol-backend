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
exports.updateUser = exports.getUser = exports.createUser = void 0;
const userModel_1 = require("../models/userModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db/db"));
const errorUtils_1 = require("../utils/errorUtils");
const phoneUtils_1 = require("../utils/phoneUtils");
const JWT_SECRET = process.env.JWT_SECRET;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, first, last, title, phone, neighborhoodId, photoUrl } = req.body;
    if (!email || !first || !last || !title || !phone || !neighborhoodId) {
        (0, errorUtils_1.showError)(res, 400, 'Email, first name, last name, title, phone, and neighborhoodId are required.');
        return;
    }
    try {
        const formattedPhone = (0, phoneUtils_1.formatPhoneNumber)(phone);
        const userExists = yield (0, userModel_1.findUserByPhoneNumber)(formattedPhone);
        if (userExists) {
            (0, errorUtils_1.showError)(res, 400, 'User already exists.');
            return;
        }
        yield db_1.default.query('INSERT INTO users (phone_number, email, first_name, last_name, title, neighborhood_id, photo_url) VALUES ($1, $2, $3, $4, $5, $6, $7)', [formattedPhone, email, first, last, title, neighborhoodId, photoUrl]);
        const user = yield (0, userModel_1.findUserByPhoneNumber)(formattedPhone);
        if (!user) {
            (0, errorUtils_1.showError)(res, 500, 'Failed to retrieve user after creation.');
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: '360d',
        });
        res.status(201).json({
            message: 'User created successfully.',
            user,
            token,
        });
    }
    catch (error) {
        const errorMessage = error.message || 'Failed to create user.';
        (0, errorUtils_1.showError)(res, 400, errorMessage);
    }
});
exports.createUser = createUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, errorUtils_1.showError)(res, 401, 'Unauthorized');
        return;
    }
    try {
        const user = yield (0, userModel_1.findUserById)(userId);
        if (!user) {
            (0, errorUtils_1.showError)(res, 404, 'User not found.');
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        const errorMessage = error.message || 'Failed to retrieve user.';
        (0, errorUtils_1.showError)(res, 500, errorMessage);
    }
});
exports.getUser = getUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, errorUtils_1.showError)(res, 401, 'Unauthorized');
        return;
    }
    const allowedUpdates = [
        'email',
        'firstName',
        'lastName',
        'title',
        'phoneNumber',
        'neighborhoodId',
        'photoUrl',
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        (0, errorUtils_1.showError)(res, 400, 'Invalid updates!');
        return;
    }
    try {
        const user = yield (0, userModel_1.findUserById)(userId);
        if (!user) {
            (0, errorUtils_1.showError)(res, 404, 'User not found.');
            return;
        }
        const updatedData = {};
        updates.forEach((update) => {
            updatedData[update] = req.body[update];
        });
        yield (0, userModel_1.updateUserById)(userId, updatedData);
        const updatedUser = yield (0, userModel_1.findUserById)(userId);
        res.status(200).json({
            message: 'User updated successfully.',
            user: updatedUser,
        });
    }
    catch (error) {
        const errorMessage = error.message || 'Failed to update user.';
        (0, errorUtils_1.showError)(res, 400, errorMessage);
    }
});
exports.updateUser = updateUser;
