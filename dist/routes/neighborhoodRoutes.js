"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const neighborhoodController_1 = require("../controllers/neighborhoodController");
const router = (0, express_1.Router)();
router.get('/:id/summary', authMiddleware_1.authenticateJWT, neighborhoodController_1.getNeighborhoodSummary);
exports.default = router;
