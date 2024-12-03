"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contributionController_1 = require("../controllers/contributionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authenticateJWT, contributionController_1.createContribution);
exports.default = router;
