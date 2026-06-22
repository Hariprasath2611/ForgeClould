import express, { Express } from 'express';
import { errorHandlerMiddleware } from '../middlewares/errorHandler';
import { logger } from '@forge/logger';
import { Server } from 'http';

export interface BootstrapConfig {
  serviceName: string;
  port: number;
  setupRoutes: (app: Express) => void;
  setupDependencies?: () => Promise<void>;
  shutdownDependencies?: () => Promise<void>;
  onServerStart?: (server: Server) => void;
}

export class ApplicationBootstrap {
  private app: Express;
  private server: Server | null = null;
  private config: BootstrapConfig;

  constructor(config: BootstrapConfig) {
    this.config = config;
    this.app = express();
  }

  private setupMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Future plugins: Helmet, CORS, Request ID injection, Morgan logger
    this.app.use((req, res, next) => {
      req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID();
      next();
    });
  }

  private setupHealthChecks() {
    this.app.get('/health', (req, res) => res.status(200).json({ status: 'OK', service: this.config.serviceName }));
    this.app.get('/live', (req, res) => res.status(200).send('Live'));
    this.app.get('/ready', (req, res) => res.status(200).send('Ready'));
  }

  public async start() {
    try {
      logger.info(`Starting bootstrap for ${this.config.serviceName}...`);

      if (this.config.setupDependencies) {
        await this.config.setupDependencies();
      }

      this.setupMiddlewares();
      this.setupHealthChecks();
      
      this.config.setupRoutes(this.app);

      // Must be the last middleware
      this.app.use(errorHandlerMiddleware);

      this.server = this.app.listen(this.config.port, () => {
        logger.info(`${this.config.serviceName} is listening on port ${this.config.port}`);
        if (this.config.onServerStart && this.server) {
          this.config.onServerStart(this.server);
        }
      });

      this.setupGracefulShutdown();
    } catch (error) {
      logger.error({ err: error }, 'Failed to bootstrap application');
      process.exit(1);
    }
  }

  private setupGracefulShutdown() {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      if (this.server) {
        this.server.close(async () => {
          logger.info('HTTP server closed.');
          if (this.config.shutdownDependencies) {
            await this.config.shutdownDependencies();
          }
          logger.info('Graceful shutdown completed.');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}
