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
exports.getUsersWithContributions = exports.getUsersByNeighborhood = exports.deleteUser = exports.updateUser = exports.getUser = exports.createUser = void 0;
const userModel_1 = require("../models/userModel");
const db_1 = __importDefault(require("../db/db"));
const errorUtils_1 = require("../utils/errorUtils");
const phoneUtils_1 = require("../utils/phoneUtils");
const caseConverter_1 = require("../utils/caseConverter");
const createUser = (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ body: userData }, res) {
    try {
        if (userData.phoneNumber) {
            userData.phoneNumber = (0, phoneUtils_1.formatPhoneNumber)(userData.phoneNumber);
        }
        const snakeUserData = (0, caseConverter_1.camelToSnake)(userData);
        const fields = Object.keys(snakeUserData).join(', ');
        const placeholders = Object.keys(snakeUserData).map((_, index) => `$${index + 1}`).join(', ');
        const values = Object.values(snakeUserData);
        const query = `INSERT INTO users (${fields}) VALUES (${placeholders}) RETURNING *`;
        const result = yield db_1.default.query(query, values);
        const user = (0, caseConverter_1.snakeToCamel)(result.rows[0]);
        user.monthlyContribution = 0;
        user.totalContribution = 0;
        res.status(201).json(user);
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
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield (0, userModel_1.deleteUserById)(userId);
        res.status(200).json({ message: 'User deleted successfully.' });
    }
    catch (error) {
        const errorMessage = error.message || 'Failed to delete user.';
        (0, errorUtils_1.showError)(res, 500, errorMessage);
    }
});
exports.deleteUser = deleteUser;
const getUsersByNeighborhood = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { neighborhoodId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!neighborhoodId) {
        (0, errorUtils_1.showError)(res, 400, 'Neighborhood ID is required.');
        return;
    }
    if (!userId) {
        (0, errorUtils_1.showError)(res, 401, 'Unauthorized');
        return;
    }
    try {
        const neighborhoodIdInt = parseInt(neighborhoodId, 10);
        if (isNaN(neighborhoodIdInt)) {
            (0, errorUtils_1.showError)(res, 400, 'Invalid Neighborhood ID.');
            return;
        }
        const userSupportSummaries = yield (0, userModel_1.getUsersByNeighborhoodWithSupportCount)(neighborhoodIdInt, userId);
        res.status(200).json(userSupportSummaries);
    }
    catch (error) {
        const errorMessage = error.message || 'Failed to retrieve users.';
        (0, errorUtils_1.showError)(res, 500, errorMessage);
    }
});
exports.getUsersByNeighborhood = getUsersByNeighborhood;
const getUsersWithContributions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { neighborhoodId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!neighborhoodId) {
        (0, errorUtils_1.showError)(res, 400, 'Neighborhood ID is required.');
        return;
    }
    if (!userId) {
        (0, errorUtils_1.showError)(res, 401, 'Unauthorized');
        return;
    }
    try {
        const neighborhoodIdInt = parseInt(neighborhoodId, 10);
        if (isNaN(neighborhoodIdInt)) {
            (0, errorUtils_1.showError)(res, 400, 'Invalid Neighborhood ID.');
            return;
        }
        const userContributionSummaries = yield (0, userModel_1.getUsersWithContributionSummaries)(neighborhoodIdInt, userId);
        res.status(200).json(userContributionSummaries);
    }
    catch (error) {
        const errorMessage = error.message || 'Failed to retrieve users with contributions.';
        (0, errorUtils_1.showError)(res, 500, errorMessage);
    }
});
exports.getUsersWithContributions = getUsersWithContributions;
