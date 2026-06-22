import { EnvironmentModel, ProjectModel } from '@forge/database';
import { NotFoundException } from '@forge/exceptions';
import { quotaService } from './QuotaService';
import { activityService } from './ActivityService';
import { socketGateway } from '../socket/SocketGateway';

export class EnvironmentUseCase {
  async updateEnvironmentStatus(
    envId: string,
    status: 'PROVISIONING' | 'ACTIVE' | 'DEPLOYING' | 'ERROR',
    actorId: string,
    actorName: string
  ) {
    const env = await EnvironmentModel.findOne({ _id: envId, deletedAt: null });
    if (!env) {
      throw new NotFoundException(`Environment ${envId} not found`);
    }

    const previousStatus = env.status;
    env.status = status;
    env.updatedBy = actorId;
    await env.save();

    const project = await ProjectModel.findById(env.projectId);
    if (project) {
      await activityService.logActivity({
        workspaceId: project.workspaceId,
        projectId: env.projectId,
        actorId,
        actorName,
        action: 'env.status_updated',
        details: { environmentName: env.name, previousStatus, status },
      });

      socketGateway.emitToProject(env.projectId, 'environment:status', env);
      socketGateway.emitToWorkspace(project.workspaceId, 'environment:status', env);
    }

    return env;
  }

  async scaleEnvironmentResources(
    envId: string,
    params: { cpu: number; memory: number; storage: number },
    actorId: string,
    actorName: string
  ) {
    const env = await EnvironmentModel.findOne({ _id: envId, deletedAt: null });
    if (!env) {
      throw new NotFoundException(`Environment ${envId} not found`);
    }

    const project = await ProjectModel.findById(env.projectId);
    if (!project) {
      throw new NotFoundException(`Project associated with environment ${envId} not found`);
    }

    // 1. Enforce Quotas on scaled CPU and RAM
    const cpuDiff = params.cpu - (env.resources.cpu || 0);
    const memDiff = params.memory - (env.resources.memory || 0);
    
    if (cpuDiff > 0 || memDiff > 0) {
      await quotaService.checkResourceQuota(project.workspaceId, Math.max(0, cpuDiff), Math.max(0, memDiff));
    }

    // 2. Perform scale
    env.resources = {
      cpu: params.cpu,
      memory: params.memory,
      storage: params.storage,
    };
    env.updatedBy = actorId;
    await env.save();

    await activityService.logActivity({
      workspaceId: project.workspaceId,
      projectId: env.projectId,
      actorId,
      actorName,
      action: 'env.scaled',
      details: { environmentName: env.name, resources: env.resources },
    });

    socketGateway.emitToProject(env.projectId, 'environment:scaled', env);
    socketGateway.emitToWorkspace(project.workspaceId, 'environment:scaled', env);

    return env;
  }

  async updateEnvironmentDomains(
    envId: string,
    customDomains: string[],
    actorId: string,
    actorName: string
  ) {
    const env = await EnvironmentModel.findOne({ _id: envId, deletedAt: null });
    if (!env) {
      throw new NotFoundException(`Environment ${envId} not found`);
    }

    env.configuration.customDomains = customDomains;
    env.updatedBy = actorId;
    await env.save();

    const project = await ProjectModel.findById(env.projectId);
    if (project) {
      await activityService.logActivity({
        workspaceId: project.workspaceId,
        projectId: env.projectId,
        actorId,
        actorName,
        action: 'env.domains_updated',
        details: { environmentName: env.name, customDomains },
      });

      socketGateway.emitToProject(env.projectId, 'environment:updated', env);
    }

    return env;
  }
}

export const environmentUseCase = new EnvironmentUseCase();
