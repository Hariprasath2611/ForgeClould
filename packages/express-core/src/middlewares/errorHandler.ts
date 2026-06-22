import { Request, Response, NextFunction } from 'express';
import { AppException } from '@forge/exceptions';
import { ApiResponse, ApiError } from '@forge/shared-types';
import { logger } from '@forge/logger';

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorCode = 'INTERNAL_ERROR';
  let details: any = undefined;
  const requestId = req.headers['x-request-id'] as string || 'unknown';

  if (err instanceof AppException) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.code;
    details = err.details;
  } else {
    logger.error({ err, requestId }, 'Unhandled Exception Caught');
  }

  const errorResponse: ApiError = {
    code: errorCode,
    message,
    details,
  };

  const response: ApiResponse<null> = {
    success: false,
    statusCode,
    message,
    data: null,
    meta: {},
    pagination: null,
    errors: [errorResponse],
    timestamp: new Date().toISOString(),
    requestId,
    version: 'v1',
  };

  res.status(statusCode).json(response);
};
