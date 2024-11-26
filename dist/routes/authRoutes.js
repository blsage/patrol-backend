"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/send-code', authController_1.sendCode);
router.post('/verify-code', authController_1.verifyCodeEndpoint);
exports.default = router;
