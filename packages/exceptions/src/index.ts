export abstract class AppException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code: string, statusCode: number, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationException extends AppException {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 'UNAUTHENTICATED', 401, details);
  }
}

export class AuthorizationException extends AppException {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 'FORBIDDEN', 403, details);
  }
}

export class NotFoundException extends AppException {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

export class ConflictException extends AppException {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 'CONFLICT', 409, details);
  }
}

export class RateLimitException extends AppException {
  constructor(message: string = 'Too many requests', details?: any) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, details);
  }
}

export class DatabaseException extends AppException {
  constructor(message: string = 'Database error', details?: any) {
    super(message, 'DATABASE_ERROR', 500, details);
  }
}

export class InternalServerException extends AppException {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, details);
  }
}
