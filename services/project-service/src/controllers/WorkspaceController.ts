import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@forge/express-core';
import { FirebaseAdapter } from '@forge/infrastructure';
import { workspaceUseCase } from '../services/WorkspaceUseCase';

export const WorkspaceController = Router();
const authAdapter = new FirebaseAdapter();

WorkspaceController.use(authenticate(authAdapter));

// Create Workspace
WorkspaceController.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const workspace = await workspaceUseCase.createWorkspace({
      name: req.body.name,
      slug: req.body.slug,
      ownerId: user.uid,
      ownerName: user.name || user.email || 'Anonymous',
    });

    res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
});

// Get User's Workspaces
WorkspaceController.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const workspaces = await workspaceUseCase.getWorkspacesForUser(user.uid);

    res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    next(error);
  }
});

// Get Workspace by ID
WorkspaceController.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = await workspaceUseCase.getWorkspaceById(req.params.id);

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
});

// Update Workspace Settings
WorkspaceController.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const workspace = await workspaceUseCase.updateWorkspace(
      req.params.id,
      req.body,
      user.uid,
      user.name || user.email || 'Anonymous'
    );

    res.status(200).json({
      success: true,
      message: 'Workspace updated successfully',
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
});
