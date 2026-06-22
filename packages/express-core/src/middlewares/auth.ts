import { Request, Response, NextFunction } from 'express';
import { IAuthenticationAdapter, DecodedAuthToken } from '@forge/infrastructure';
import { UnauthorizedException } from '@forge/exceptions';

// Augment Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedAuthToken;
    }
  }
}

export const authenticate = (authAdapter: IAuthenticationAdapter) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or invalid Authorization header');
      }

      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await authAdapter.verifyToken(token);
      
      // Attach the decoded token to the request
      req.user = decodedToken;
      next();
    } catch (error: any) {
      next(new UnauthorizedException(error.message || 'Authentication failed'));
    }
  };
};
