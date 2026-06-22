import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@forge/express-core';
import { FirebaseAdapter } from '@forge/infrastructure';
import { quotaService } from '../services/QuotaService';

export const QuotaController = Router();
const authAdapter = new FirebaseAdapter();

QuotaController.use(authenticate(authAdapter));

// Get Workspace Usage and Quota limits
QuotaController.get('/:workspaceId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quotaInfo = await quotaService.getWorkspaceUsage(req.params.workspaceId);
    
    res.status(200).json({
      success: true,
      data: quotaInfo,
    });
  } catch (error) {
    next(error);
  }
});
