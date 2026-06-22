import { z } from 'zod';

export const validateEnv = <T extends z.ZodTypeAny>(schema: T, env: NodeJS.ProcessEnv): z.infer<T> => {
  const parsed = schema.safeParse(env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }
  
  return parsed.data;
};

// Base application environment schema
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
