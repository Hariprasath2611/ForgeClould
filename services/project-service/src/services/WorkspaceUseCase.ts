import { WorkspaceModel } from '@forge/database';
import { ConflictException, NotFoundException } from '@forge/exceptions';
import { activityService } from './ActivityService';
import { logger } from '@forge/logger';

export class WorkspaceUseCase {
  async createWorkspace(params: { name: string; slug?: string; ownerId: string; ownerName: string }) {
    const slug = params.slug || this.generateSlug(params.name);
    
    // Check if workspace slug already exists
    const existing = await WorkspaceModel.findOne({ slug, deletedAt: null });
    if (existing) {
      throw new ConflictException(`Workspace with slug '${slug}' already exists`);
    }

    const workspace = await WorkspaceModel.create({
      name: params.name,
      slug,
      ownerId: params.ownerId,
      organizationId: 'default', // standard base schema requirement
      createdBy: params.ownerId,
    });

    await activityService.logActivity({
      workspaceId: workspace._id.toString(),
      actorId: params.ownerId,
      actorName: params.ownerName,
      action: 'workspace.created',
      details: { name: workspace.name, slug: workspace.slug },
    });

    return workspace;
  }

  async getWorkspaceById(id: string) {
    const workspace = await WorkspaceModel.findOne({ _id: id, deletedAt: null });
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
    return workspace;
  }

  async getWorkspacesForUser(userId: string) {
    // Return workspaces where user is owner (or in a complete RBAC system, member)
    return await WorkspaceModel.find({ ownerId: userId, deletedAt: null });
  }

  async updateWorkspace(id: string, data: any, actorId: string, actorName: string) {
    const workspace = await WorkspaceModel.findOne({ _id: id, deletedAt: null });
    if (!workspace) {
      throw new NotFoundException(`Workspace ${id} not found`);
    }

    // Handle slug change checks
    if (data.slug && data.slug !== workspace.slug) {
      const existing = await WorkspaceModel.findOne({ slug: data.slug, deletedAt: null });
      if (existing) {
        throw new ConflictException(`Workspace with slug '${data.slug}' already exists`);
      }
    }

    const updated = await WorkspaceModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { ...data, updatedBy: actorId },
      { new: true }
    );

    if (!updated) {
      throw new NotFoundException(`Failed to update workspace ${id}`);
    }

    await activityService.logActivity({
      workspaceId: id,
      actorId,
      actorName,
      action: 'workspace.updated',
      details: { updatedFields: Object.keys(data) },
    });

    return updated;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}

export const workspaceUseCase = new WorkspaceUseCase();
