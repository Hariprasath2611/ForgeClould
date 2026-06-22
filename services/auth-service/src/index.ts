import dotenv from 'dotenv';
import path from 'path';
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config(); // fallback to local service .env

import mongoose from 'mongoose';
import { ApplicationBootstrap } from '@forge/express-core';
import { logger } from '@forge/logger';
import { AuthController } from './infrastructure/controllers/AuthController';

const serviceName = 'auth-service';
const port = parseInt(process.env.PORT || '3001', 10);
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/forgecloud';

const bootstrap = new ApplicationBootstrap({
  serviceName,
  port,
  setupRoutes: (app) => {
    logger.info('Registering routes for auth-service...');
    app.use('/api/v1/auth', AuthController);
  },
  setupDependencies: async () => {
    logger.info(`Connecting to MongoDB at ${mongoUri}`);
    await mongoose.connect(mongoUri);
    logger.info('Successfully connected to MongoDB');
  },
  shutdownDependencies: async () => {
    logger.info('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    logger.info('Successfully disconnected from MongoDB');
  },
});

bootstrap.start();
