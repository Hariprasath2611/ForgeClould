import { ProjectModel, EnvironmentModel, ProjectMemberModel, WorkspaceModel } from '@forge/database';
import { ConflictException, NotFoundException } from '@forge/exceptions';
import { quotaService } from './QuotaService';
import { activityService } from './ActivityService';
import { socketGateway } from '../socket/SocketGateway';
import { logger } from '@forge/logger';

export class ProjectUseCase {
  async createProject(params: {
    workspaceId: string;
    name: string;
    slug?: string;
    description?: string;
    ownerId: string;
    ownerName: string;
    framework: string;
    repository: string;
    branch?: string;
  }) {
    // 1. Enforce Workspace Quota
    await quotaService.checkProjectCreationLimit(params.workspaceId);

    const slug = params.slug || this.generateSlug(params.name);

    // 2. Check if slug exists in workspace
    const existing = await ProjectModel.findOne({
      workspaceId: params.workspaceId,
      slug,
      status: { $ne: 'DELETED' },
      deletedAt: null,
    });
    if (existing) {
      throw new ConflictException(`A project with slug '${slug}' already exists in this workspace`);
    }

    // 3. Create Project record
    const project = await ProjectModel.create({
      workspaceId: params.workspaceId,
      name: params.name,
      slug,
      description: params.description,
      ownerId: params.ownerId,
      framework: params.framework,
      sourceControl: {
        provider: 'github',
        repository: params.repository,
        branch: params.branch || 'main',
      },
      status: 'ACTIVE',
      organizationId: 'default',
      createdBy: params.ownerId,
    });

    // 4. Provision default environments: dev, staging, prod
    const envConfigs = [
      { name: 'development' as const, slug: 'dev' },
      { name: 'staging' as const, slug: 'staging' },
      { name: 'production' as const, slug: 'prod' },
    ];

    const environments = await Promise.all(
      envConfigs.map((cfg) =>
        EnvironmentModel.create({
          projectId: project._id.toString(),
          name: cfg.name,
          slug: cfg.slug,
          status: 'PROVISIONING',
          resources: {
            cpu: 0.5,
            memory: 512,
            storage: 1024,
          },
          organizationId: 'default',
          createdBy: params.ownerId,
        })
      )
    );

    // 5. Create Project Owner membership
    const ownerMember = await ProjectMemberModel.create({
      projectId: project._id.toString(),
      userId: params.ownerId,
      roleId: 'OWNER',
      status: 'ACTIVE',
      organizationId: 'default',
      createdBy: params.ownerId,
    });

    // 6. Log Activity
    await activityService.logActivity({
      workspaceId: params.workspaceId,
      projectId: project._id.toString(),
      actorId: params.ownerId,
      actorName: params.ownerName,
      action: 'project.created',
      details: {
        projectName: project.name,
        framework: project.framework,
        repository: project.sourceControl.repository,
      },
    });

    // 7. Emit Real-time Sync
    socketGateway.emitToWorkspace(params.workspaceId, 'project:created', {
      project,
      environments,
    });

    return { project, environments, ownerMember };
  }

  async getProjectsInWorkspace(workspaceId: string, query: { status?: string } = {}) {
    const statusFilter = query.status || { $ne: 'DELETED' };
    return await ProjectModel.find({
      workspaceId,
      status: statusFilter,
      deletedAt: null,
    });
  }

  async getProjectDetails(projectId: string) {
    const project = await ProjectModel.findOne({ _id: projectId, deletedAt: null });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const [environments, members] = await Promise.all([
      EnvironmentModel.find({ projectId, deletedAt: null }),
      ProjectMemberModel.find({ projectId, deletedAt: null }),
    ]);

    return {
      project,
      environments,
      members,
    };
  }

  async updateProject(
    projectId: string,
    data: any,
    actorId: string,
    actorName: string
  ) {
    const project = await ProjectModel.findOne({ _id: projectId, deletedAt: null });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    // Slug unique checks if modified
    if (data.slug && data.slug !== project.slug) {
      const existing = await ProjectModel.findOne({
        workspaceId: project.workspaceId,
        slug: data.slug,
        status: { $ne: 'DELETED' },
        deletedAt: null,
      });
      if (existing) {
        throw new ConflictException(`Project with slug '${data.slug}' already exists in workspace`);
      }
    }

    const updated = await ProjectModel.findOneAndUpdate(
      { _id: projectId, deletedAt: null },
      { ...data, updatedBy: actorId },
      { new: true }
    );

    if (!updated) {
      throw new NotFoundException(`Failed to update project ${projectId}`);
    }

    await activityService.logActivity({
      workspaceId: project.workspaceId,
      projectId,
      actorId,
      actorName,
      action: 'project.updated',
      details: { updatedFields: Object.keys(data) },
    });

    socketGateway.emitToProject(projectId, 'project:updated', updated);
    socketGateway.emitToWorkspace(project.workspaceId, 'project:updated', updated);

    return updated;
  }

  async archiveProject(projectId: string, actorId: string, actorName: string) {
    const project = await ProjectModel.findOne({ _id: projectId, status: 'ACTIVE', deletedAt: null });
    if (!project) {
      throw new NotFoundException(`Active Project ${projectId} not found`);
    }

    project.status = 'ARCHIVED';
    (project as any).updatedBy = actorId;
    await project.save();

    await activityService.logActivity({
      workspaceId: project.workspaceId,
      projectId,
      actorId,
      actorName,
      action: 'project.archived',
      details: { projectName: project.name },
    });

    socketGateway.emitToProject(projectId, 'project:archived', project);
    socketGateway.emitToWorkspace(project.workspaceId, 'project:updated', project);

    return project;
  }

  async restoreProject(projectId: string, actorId: string, actorName: string) {
    const project = await ProjectModel.findOne({ _id: projectId, status: 'ARCHIVED', deletedAt: null });
    if (!project) {
      throw new NotFoundException(`Archived Project ${projectId} not found`);
    }

    project.status = 'ACTIVE';
    (project as any).updatedBy = actorId;
    await project.save();

    await activityService.logActivity({
      workspaceId: project.workspaceId,
      projectId,
      actorId,
      actorName,
      action: 'project.restored',
      details: { projectName: project.name },
    });

    socketGateway.emitToProject(projectId, 'project:restored', project);
    socketGateway.emitToWorkspace(project.workspaceId, 'project:updated', project);

    return project;
  }

  async softDeleteProject(projectId: string, actorId: string, actorName: string) {
    const project = await ProjectModel.findOne({ _id: projectId, status: { $ne: 'DELETED' }, deletedAt: null });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    project.status = 'DELETED';
    (project as any).deletedAt = new Date();
    (project as any).deletedBy = actorId;
    await project.save();

    // Soft delete environments & members too
    await Promise.all([
      EnvironmentModel.updateMany({ projectId }, { deletedAt: new Date(), deletedBy: actorId }),
      ProjectMemberModel.updateMany({ projectId }, { deletedAt: new Date(), deletedBy: actorId }),
    ]);

    await activityService.logActivity({
      workspaceId: project.workspaceId,
      projectId,
      actorId,
      actorName,
      action: 'project.deleted_soft',
      details: { projectName: project.name },
    });

    socketGateway.emitToWorkspace(project.workspaceId, 'project:deleted', { projectId });

    return project;
  }

  async permanentDeleteProject(projectId: string, actorId: string, actorName: string) {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const workspaceId = project.workspaceId;
    const name = project.name;

    await Promise.all([
      ProjectModel.deleteOne({ _id: projectId }),
      EnvironmentModel.deleteMany({ projectId }),
      ProjectMemberModel.deleteMany({ projectId }),
    ]);

    await activityService.logActivity({
      workspaceId,
      actorId,
      actorName,
      action: 'project.deleted_permanent',
      details: { projectName: name },
    });

    socketGateway.emitToWorkspace(workspaceId, 'project:deleted_permanent', { projectId });
  }

  async cloneProject(params: {
    projectId: string;
    targetWorkspaceId: string;
    actorId: string;
    actorName: string;
  }) {
    // 1. Enforce target Workspace Quota
    await quotaService.checkProjectCreationLimit(params.targetWorkspaceId);

    // 2. Read source project
    const sourceProject = await ProjectModel.findOne({ _id: params.projectId, deletedAt: null });
    if (!sourceProject) {
      throw new NotFoundException(`Source Project ${params.projectId} not found`);
    }

    // 3. Generate clone details
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const newName = `Clone of ${sourceProject.name}`;
    const newSlug = `${sourceProject.slug}-clone-${suffix}`;

    // 4. Create cloned project
    const clonedProject = await ProjectModel.create({
      workspaceId: params.targetWorkspaceId,
      name: newName,
      slug: newSlug,
      description: sourceProject.description,
      ownerId: params.actorId,
      framework: sourceProject.framework,
      sourceControl: sourceProject.sourceControl,
      settings: sourceProject.settings, // duplicate environment vars & build commands
      status: 'ACTIVE',
      organizationId: 'default',
      createdBy: params.actorId,
    });

    // 5. Copy environments
    const sourceEnvironments = await EnvironmentModel.find({ projectId: params.projectId, deletedAt: null });
    const clonedEnvironments = await Promise.all(
      sourceEnvironments.map((env) =>
        EnvironmentModel.create({
          projectId: clonedProject._id.toString(),
          name: env.name,
          slug: env.slug,
          status: 'PROVISIONING',
          resources: env.resources,
          configuration: env.configuration,
          organizationId: 'default',
          createdBy: params.actorId,
        })
      )
    );

    // 6. Create Owner membership
    await ProjectMemberModel.create({
      projectId: clonedProject._id.toString(),
      userId: params.actorId,
      roleId: 'OWNER',
      status: 'ACTIVE',
      organizationId: 'default',
      createdBy: params.actorId,
    });

    // 7. Log activity
    await activityService.logActivity({
      workspaceId: params.targetWorkspaceId,
      projectId: clonedProject._id.toString(),
      actorId: params.actorId,
      actorName: params.actorName,
      action: 'project.cloned',
      details: {
        sourceProjectId: params.projectId,
        sourceProjectName: sourceProject.name,
        clonedProjectName: clonedProject.name,
      },
    });

    socketGateway.emitToWorkspace(params.targetWorkspaceId, 'project:created', {
      project: clonedProject,
      environments: clonedEnvironments,
    });

    return { project: clonedProject, environments: clonedEnvironments };
  }

  async transferOwnership(
    projectId: string,
    newOwnerId: string,
    actorId: string,
    actorName: string
  ) {
    const project = await ProjectModel.findOne({ _id: projectId, deletedAt: null });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const previousOwnerId = project.ownerId;
    project.ownerId = newOwnerId;
    (project as any).updatedBy = actorId;
    await project.save();

    // Sync project member role to OWNER for the new owner, and previous owner to ADMIN
    await ProjectMemberModel.findOneAndUpdate(
      { projectId, userId: newOwnerId, deletedAt: null },
      { roleId: 'OWNER' },
      { upsert: true }
    );

    await ProjectMemberModel.findOneAndUpdate(
      { projectId, userId: previousOwnerId, deletedAt: null },
      { roleId: 'ADMIN' }
    );

    await activityService.logActivity({
      workspaceId: project.workspaceId,
      projectId,
      actorId,
      actorName,
      action: 'project.owner_transferred',
      details: { previousOwnerId, newOwnerId },
    });

    socketGateway.emitToProject(projectId, 'project:updated', project);
    socketGateway.emitToWorkspace(project.workspaceId, 'project:updated', project);

    return project;
  }

  async exportConfiguration(projectId: string) {
    const project = await ProjectModel.findOne({ _id: projectId, deletedAt: null });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    return {
      framework: project.framework,
      sourceControl: project.sourceControl,
      settings: project.settings,
    };
  }

  async importConfiguration(
    projectId: string,
    config: any,
    actorId: string,
    actorName: string
  ) {
    const project = await ProjectModel.findOne({ _id: projectId, deletedAt: null });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    if (config.framework) project.framework = config.framework;
    if (config.sourceControl) project.sourceControl = config.sourceControl;
    if (config.settings) project.settings = config.settings;

    (project as any).updatedBy = actorId;
    await project.save();

    await activityService.logActivity({
      workspaceId: project.workspaceId,
      projectId,
      actorId,
      actorName,
      action: 'project.config_imported',
      details: { configKeys: Object.keys(config) },
    });

    socketGateway.emitToProject(projectId, 'project:updated', project);
    socketGateway.emitToWorkspace(project.workspaceId, 'project:updated', project);

    return project;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}

export const projectUseCase = new ProjectUseCase();
