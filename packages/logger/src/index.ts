import pino from 'pino';

// Define sensitive fields to mask automatically
const redactFields = [
  'password',
  'token',
  'jwt',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'creditCard',
  'cvv',
  'ssn',
  '*.password',
  '*.token',
  '*.secret',
];

export const createLogger = (serviceName: string, level: string = 'info') => {
  return pino({
    level,
    name: serviceName,
    redact: {
      paths: redactFields,
      censor: '***MASKED***',
    },
    formatters: {
      level: (label) => ({ level: label }), // output string level instead of number
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      service: serviceName,
    },
  });
};

export const logger = createLogger('forgecloud-core');

// Context storage for Correlation IDs (can be plugged with AsyncLocalStorage in express)
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  correlationId: string;
  requestId: string;
  organizationId?: string;
  userId?: string;
}

export const requestContextStore = new AsyncLocalStorage<RequestContext>();

export const getLoggerWithContext = (baseLogger: pino.Logger = logger) => {
  const context = requestContextStore.getStore();
  if (context) {
    return baseLogger.child({
      correlationId: context.correlationId,
      requestId: context.requestId,
      organizationId: context.organizationId,
      userId: context.userId,
    });
  }
  return baseLogger;
};
