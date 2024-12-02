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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupport = void 0;
const supportModel_1 = require("../models/supportModel");
const userModel_1 = require("../models/userModel");
const errorUtils_1 = require("../utils/errorUtils");
const createSupport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const neighborhoodId = user.neighborhoodId;
        const support = yield (0, supportModel_1.createSupportEntry)(userId, neighborhoodId);
        res.status(201).json(support);
    }
    catch (error) {
        const errorMessage = error.message || 'Failed to create support.';
        (0, errorUtils_1.showError)(res, 500, errorMessage);
    }
});
exports.createSupport = createSupport;
