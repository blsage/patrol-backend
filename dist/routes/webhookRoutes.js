"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhookController_1 = require("../controllers/webhookController");
const router = (0, express_1.Router)();
const body_parser_1 = __importDefault(require("body-parser"));
router.post('/stripe', body_parser_1.default.raw({ type: 'application/json' }), webhookController_1.handleStripeWebhook);
exports.default = router;
