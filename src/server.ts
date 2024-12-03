import express from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import storageRoutes from './routes/storageRoutes';
import supportRoutes from './routes/supportRoutes';
import contributionRoutes from './routes/contributionRoutes';
import webhookRoutes from './routes/webhookRoutes';

import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use('/webhook', webhookRoutes);

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/storage', storageRoutes);
app.use('/support', supportRoutes);
app.use('/contributions', contributionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
