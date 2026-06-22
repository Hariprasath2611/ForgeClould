import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@forge/express-core';
import { FirebaseAdapter } from '@forge/infrastructure';
import { authUseCase } from '../../application/use-cases/AuthUseCase';

export const AuthController = Router();

const authAdapter = new FirebaseAdapter();

// Require a valid Firebase token to hit this endpoint
AuthController.post('/sync', authenticate(authAdapter), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decodedToken = req.user; // Attached by the authenticate middleware
    
    if (!decodedToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const clientInfo = {
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    const result = await authUseCase.syncUser(decodedToken, clientInfo);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});
