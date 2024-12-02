"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const supportController_1 = require("../controllers/supportController");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authenticateJWT, supportController_1.createSupport);
exports.default = router;
