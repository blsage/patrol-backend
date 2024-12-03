"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const storageRoutes_1 = __importDefault(require("./routes/storageRoutes"));
const supportRoutes_1 = __importDefault(require("./routes/supportRoutes"));
const contributionRoutes_1 = __importDefault(require("./routes/contributionRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/auth', authRoutes_1.default);
app.use('/users', userRoutes_1.default);
app.use('/storage', storageRoutes_1.default);
app.use('/support', supportRoutes_1.default);
app.use('/contributions', contributionRoutes_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
