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
exports.getNeighborhoodSummary = void 0;
const neighborhoodModel_1 = require("../models/neighborhoodModel");
const errorUtils_1 = require("../utils/errorUtils");
const getNeighborhoodSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const neighborhoodId = parseInt(req.params.id, 10);
    if (isNaN(neighborhoodId)) {
        (0, errorUtils_1.showError)(res, 400, 'Invalid Neighborhood ID.');
        return;
    }
    try {
        const summary = yield (0, neighborhoodModel_1.getNeighborhoodSummary)(neighborhoodId);
        if (!summary) {
            (0, errorUtils_1.showError)(res, 404, 'Neighborhood not found.');
            return;
        }
        res.status(200).json(summary);
    }
    catch (error) {
        const errorMessage = error.message || 'Failed to retrieve neighborhood summary.';
        (0, errorUtils_1.showError)(res, 500, errorMessage);
    }
});
exports.getNeighborhoodSummary = getNeighborhoodSummary;
