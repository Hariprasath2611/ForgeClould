import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '@forge/logger';

export class SocketGateway {
  private static instance: SocketGateway;
  private io: Server | null = null;

  private constructor() {}

  public static getInstance(): SocketGateway {
    if (!SocketGateway.instance) {
      SocketGateway.instance = new SocketGateway();
    }
    return SocketGateway.instance;
  }

  public initialize(server: HttpServer): Server {
    this.io = new Server(server, {
      cors: {
        origin: '*', // In production, restrict to allowed origins
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      // Allow client to join workspace or project rooms
      socket.on('join:workspace', (workspaceId: string) => {
        socket.join(`workspace:${workspaceId}`);
        logger.info(`Socket ${socket.id} joined room workspace:${workspaceId}`);
      });

      socket.on('leave:workspace', (workspaceId: string) => {
        socket.leave(`workspace:${workspaceId}`);
        logger.info(`Socket ${socket.id} left room workspace:${workspaceId}`);
      });

      socket.on('join:project', (projectId: string) => {
        socket.join(`project:${projectId}`);
        logger.info(`Socket ${socket.id} joined room project:${projectId}`);
      });

      socket.on('leave:project', (projectId: string) => {
        socket.leave(`project:${projectId}`);
        logger.info(`Socket ${socket.id} left room project:${projectId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  public emitToWorkspace(workspaceId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`workspace:${workspaceId}`).emit(event, data);
      logger.debug(`Emitted event ${event} to workspace room workspace:${workspaceId}`);
    }
  }

  public emitToProject(projectId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`project:${projectId}`).emit(event, data);
      logger.debug(`Emitted event ${event} to project room project:${projectId}`);
    }
  }

  public emitGlobal(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
      logger.debug(`Emitted global event ${event}`);
    }
  }
}

export const socketGateway = SocketGateway.getInstance();
