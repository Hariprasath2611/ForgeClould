import dotenv from 'dotenv';
import path from 'path';
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config(); // fallback to local service .env

import mongoose from 'mongoose';
import { ApplicationBootstrap } from '@forge/express-core';
import { logger } from '@forge/logger';
import { socketGateway } from './socket/SocketGateway';
import { WorkspaceController } from './controllers/WorkspaceController';
import { ProjectController } from './controllers/ProjectController';
import { EnvironmentController } from './controllers/EnvironmentController';
import { QuotaController } from './controllers/QuotaController';

const serviceName = 'project-service';
const port = parseInt(process.env.PORT || '3002', 10);
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/forgecloud';

const bootstrap = new ApplicationBootstrap({
  serviceName,
  port,
  setupRoutes: (app) => {
    logger.info('Registering routes for project-service...');
    app.use('/v1/workspaces', WorkspaceController);
    app.use('/v1/projects', ProjectController);
    app.use('/v1/environments', EnvironmentController);
    app.use('/v1/quotas', QuotaController);
  },
  setupDependencies: async () => {
    logger.info(`Connecting to MongoDB at ${mongoUri}`);
    await mongoose.connect(mongoUri);
    logger.info('Successfully connected to MongoDB');
  },
  onServerStart: (server) => {
    logger.info('Initializing Socket.io Gateway on server start...');
    socketGateway.initialize(server);
    logger.info('Socket.io Gateway successfully initialized');
  },
  shutdownDependencies: async () => {
    logger.info('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    logger.info('Successfully disconnected from MongoDB');
  },
});

bootstrap.start();
