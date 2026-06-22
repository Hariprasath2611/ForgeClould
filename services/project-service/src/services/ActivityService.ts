import { ActivityModel } from '@forge/database';
import { socketGateway } from '../socket/SocketGateway';
import { logger } from '@forge/logger';

export class ActivityService {
  async logActivity(params: {
    workspaceId: string;
    projectId?: string;
    actorId: string;
    actorName: string;
    action: string;
    details?: Record<string, any>;
    ipAddress?: string;
    requestId?: string;
  }) {
    try {
      const activity = await ActivityModel.create({
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        actorId: params.actorId,
        actorName: params.actorName,
        action: params.action,
        details: params.details || {},
        organizationId: 'default', // standard base schema requirement
        createdBy: params.actorId,
      });

      // Emit real-time event to workspace subscribers
      socketGateway.emitToWorkspace(params.workspaceId, 'activity:new', activity);
      
      if (params.projectId) {
        // Also emit to project subscribers
        socketGateway.emitToProject(params.projectId, 'activity:new', activity);
      }

      return activity;
    } catch (error) {
      logger.error({ err: error }, 'Failed to log activity event');
    }
  }
}

export const activityService = new ActivityService();
