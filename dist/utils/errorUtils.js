"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showError = void 0;
const showError = (res, statusCode, message) => {
    console.error(`Status Code: ${statusCode}, Message: ${message}`);
    res.status(statusCode).json({ message });
};
exports.showError = showError;
