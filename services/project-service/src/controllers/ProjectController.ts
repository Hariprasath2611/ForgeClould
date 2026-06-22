import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@forge/express-core';
import { FirebaseAdapter } from '@forge/infrastructure';
import { projectUseCase } from '../services/ProjectUseCase';
import { ValidationException } from '@forge/exceptions';

export const ProjectController = Router();
const authAdapter = new FirebaseAdapter();

ProjectController.use(authenticate(authAdapter));

// Create Project
ProjectController.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { workspaceId, name, slug, description, framework, repository, branch } = req.body;

    if (!workspaceId || !name || !repository) {
      throw new ValidationException('workspaceId, name, and repository are required');
    }

    const result = await projectUseCase.createProject({
      workspaceId,
      name,
      slug,
      description,
      ownerId: user.uid,
      ownerName: user.name || user.email || 'Anonymous',
      framework: framework || 'nextjs',
      repository,
      branch,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// List Projects in Workspace
ProjectController.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId, status } = req.query;

    if (!workspaceId) {
      throw new ValidationException('workspaceId is a required query parameter');
    }

    const projects = await projectUseCase.getProjectsInWorkspace(workspaceId as string, { status: status as string });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
});

// Get Project Details (including environments and members)
ProjectController.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const details = await projectUseCase.getProjectDetails(req.params.id);
    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
});

// Update Project settings
ProjectController.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const updated = await projectUseCase.updateProject(
      req.params.id,
      req.body,
      user.uid,
      user.name || user.email || 'Anonymous'
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Archive Project
ProjectController.post('/:id/archive', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const archived = await projectUseCase.archiveProject(
      req.params.id,
      user.uid,
      user.name || user.email || 'Anonymous'
    );

    res.status(200).json({
      success: true,
      message: 'Project archived successfully',
      data: archived,
    });
  } catch (error) {
    next(error);
  }
});

// Restore Project
ProjectController.post('/:id/restore', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const restored = await projectUseCase.restoreProject(
      req.params.id,
      user.uid,
      user.name || user.email || 'Anonymous'
    );

    res.status(200).json({
      success: true,
      message: 'Project restored successfully',
      data: restored,
    });
  } catch (error) {
    next(error);
  }
});

// Delete Project (Soft or Permanent)
ProjectController.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { permanent } = req.query;

    if (permanent === 'true') {
      // Typically, check if user is admin. Here we allow it for demonstration.
      await projectUseCase.permanentDeleteProject(
        req.params.id,
        user.uid,
        user.name || user.email || 'Anonymous'
      );

      return res.status(200).json({
        success: true,
        message: 'Project permanently deleted',
      });
    }

    const softDeleted = await projectUseCase.softDeleteProject(
      req.params.id,
      user.uid,
      user.name || user.email || 'Anonymous'
    );

    res.status(200).json({
      success: true,
      message: 'Project soft-deleted successfully',
      data: softDeleted,
    });
  } catch (error) {
    next(error);
  }
});

// Clone Project
ProjectController.post('/:id/clone', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { targetWorkspaceId } = req.body;

    if (!targetWorkspaceId) {
      throw new ValidationException('targetWorkspaceId is required in request body');
    }

    const cloned = await projectUseCase.cloneProject({
      projectId: req.params.id,
      targetWorkspaceId,
      actorId: user.uid,
      actorName: user.name || user.email || 'Anonymous',
    });

    res.status(201).json({
      success: true,
      message: 'Project cloned successfully',
      data: cloned,
    });
  } catch (error) {
    next(error);
  }
});

// Transfer Ownership
ProjectController.post('/:id/transfer-ownership', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { newOwnerId } = req.body;

    if (!newOwnerId) {
      throw new ValidationException('newOwnerId is required in request body');
    }

    const updated = await projectUseCase.transferOwnership(
      req.params.id,
      newOwnerId,
      user.uid,
      user.name || user.email || 'Anonymous'
    );

    res.status(200).json({
      success: true,
      message: 'Project ownership transferred successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Export Config
ProjectController.get('/:id/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await projectUseCase.exportConfiguration(req.params.id);
    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
});

// Import Config
ProjectController.post('/:id/import', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const updated = await projectUseCase.importConfiguration(
      req.params.id,
      req.body,
      user.uid,
      user.name || user.email || 'Anonymous'
    );

    res.status(200).json({
      success: true,
      message: 'Configuration imported successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});
