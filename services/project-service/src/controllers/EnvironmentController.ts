import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@forge/express-core';
import { FirebaseAdapter } from '@forge/infrastructure';
import { environmentUseCase } from '../services/EnvironmentUseCase';
import { BadRequestException } from '@forge/exceptions';

export const EnvironmentController = Router();
const authAdapter = new FirebaseAdapter();

EnvironmentController.use(authenticate(authAdapter));

// Update Environment Status
EnvironmentController.put('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { status } = req.body;

    if (!status) {
      throw new BadRequestException('status is required in request body');
    }

    const updated = await environmentUseCase.updateEnvironmentStatus(
      req.params.id,
      status,
      user.uid,
      user.name || user.email || 'Anonymous'
    );

    res.status(200).json({
      success: true,
      message: 'Environment status updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Scale Environment Resources
EnvironmentController.post('/:id/scale', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { cpu, memory, storage } = req.body;

    if (cpu === undefined || memory === undefined || storage === undefined) {
      throw new BadRequestException('cpu, memory, and storage are required in request body');
    }

    const updated = await environmentUseCase.scaleEnvironmentResources(
      req.params.id,
      { cpu, memory, storage },
      user.uid,
      user.name || user.email || 'Anonymous'
    );

    res.status(200).json({
      success: true,
      message: 'Environment scaled successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Update Environment Custom Domains
EnvironmentController.put('/:id/domains', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { customDomains } = req.body;

    if (!Array.isArray(customDomains)) {
      throw new BadRequestException('customDomains must be an array of strings');
    }

    const updated = await environmentUseCase.updateEnvironmentDomains(
      req.params.id,
      customDomains,
      user.uid,
      user.name || user.email || 'Anonymous'
    );

    res.status(200).json({
      success: true,
      message: 'Environment domains updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});
