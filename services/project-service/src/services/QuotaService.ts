import { WorkspaceModel, ProjectModel, EnvironmentModel, ProjectMemberModel } from '@forge/database';
import { AuthorizationException, NotFoundException } from '@forge/exceptions';

export class QuotaService {
  async getWorkspaceUsage(workspaceId: string) {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    const projects = await ProjectModel.find({
      workspaceId,
      status: { $ne: 'DELETED' },
      deletedAt: null,
    });
    const projectIds = projects.map((p) => p._id.toString());

    const [projectCount, memberCount, environments] = await Promise.all([
      ProjectModel.countDocuments({ workspaceId, status: { $ne: 'DELETED' }, deletedAt: null }),
      ProjectMemberModel.countDocuments({ projectId: { $in: projectIds }, deletedAt: null }),
      EnvironmentModel.find({ projectId: { $in: projectIds }, deletedAt: null }),
    ]);

    let cpuCores = 0;
    let memoryMB = 0;
    let storageGB = 0;

    for (const env of environments) {
      cpuCores += env.resources.cpu || 0;
      memoryMB += env.resources.memory || 0;
      storageGB += (env.resources.storage || 0) / 1024; // MB to GB
    }

    return {
      limits: workspace.quotas,
      usage: {
        projects: projectCount,
        members: memberCount,
        cpuCores,
        memoryMB,
        storageGB,
      },
    };
  }

  async checkProjectCreationLimit(workspaceId: string) {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    const currentCount = await ProjectModel.countDocuments({
      workspaceId,
      status: { $ne: 'DELETED' },
      deletedAt: null,
    });

    if (currentCount >= workspace.quotas.maxProjects) {
      throw new AuthorizationException(
        `Workspace project limit reached (${currentCount}/${workspace.quotas.maxProjects}). Please upgrade your workspace.`
      );
    }
  }

  async checkMemberLimit(projectId: string) {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const workspace = await WorkspaceModel.findById(project.workspaceId);
    if (!workspace) {
      throw new NotFoundException(`Workspace ${project.workspaceId} not found`);
    }

    const currentCount = await ProjectMemberModel.countDocuments({
      projectId,
      deletedAt: null,
    });

    if (currentCount >= workspace.quotas.maxMembers) {
      throw new AuthorizationException(
        `Project member limit reached (${currentCount}/${workspace.quotas.maxMembers}). Please upgrade your workspace.`
      );
    }
  }

  async checkResourceQuota(workspaceId: string, additionalCpu: number, additionalMemory: number) {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    const projects = await ProjectModel.find({
      workspaceId,
      status: { $ne: 'DELETED' },
      deletedAt: null,
    });
    const projectIds = projects.map((p) => p._id.toString());

    const environments = await EnvironmentModel.find({
      projectId: { $in: projectIds },
      deletedAt: null,
    });

    let currentCpu = 0;
    let currentMemory = 0;

    for (const env of environments) {
      currentCpu += env.resources.cpu || 0;
      currentMemory += env.resources.memory || 0;
    }

    if (currentCpu + additionalCpu > workspace.quotas.maxCpuCores) {
      throw new AuthorizationException(
        `CPU core quota exceeded. Requested: ${currentCpu + additionalCpu} Cores, Limit: ${workspace.quotas.maxCpuCores} Cores.`
      );
    }

    if (currentMemory + additionalMemory > workspace.quotas.maxMemoryMB) {
      throw new AuthorizationException(
        `Memory quota exceeded. Requested: ${currentMemory + additionalMemory} MB, Limit: ${workspace.quotas.maxMemoryMB} MB.`
      );
    }
  }
}

export const quotaService = new QuotaService();
