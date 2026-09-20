import { z } from 'zod';

/**
 * Server-side environment variable schema.
 * Validated at startup — the app will not start with invalid config.
 */
const envSchema = z.object({
  // General
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // MongoDB
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@sbmpnexus.com'),

  // S3 Storage
  STORAGE_ENDPOINT: z.string().default('http://localhost:9000'),
  STORAGE_REGION: z.string().default('us-east-1'),
  STORAGE_BUCKET: z.string().default('sbmpnexus'),
  STORAGE_ACCESS_KEY: z.string().default('minioadmin'),
  STORAGE_SECRET_KEY: z.string().default('minioadmin'),
  STORAGE_USE_SSL: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),

  // NVIDIA AI
  NVIDIA_API_KEY: z.string().optional(),
  NVIDIA_BASE_URL: z.string().default('https://integrate.api.nvidia.com/v1'),
  NVIDIA_TEXT_MODEL: z.string().default('meta/llama-3.3-70b-instruct'),
  NVIDIA_VISION_MODEL: z.string().default('nvidia/nemotron-parse-2.0'),

  // Application
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().default(50),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().default(5),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _config: EnvConfig | null = null;

/**
 * Parse and validate environment variables.
 * Call once at application startup.
 * Throws on invalid config to prevent startup with bad configuration.
 */
export function loadEnv(env: Record<string, string | undefined> = process.env): EnvConfig {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    const formatted = result.error.format();
    const errorMessages = Object.entries(formatted)
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => {
        const errors = (value as { _errors?: string[] })?._errors?.join(', ') || 'Invalid';
        return `  ${key}: ${errors}`;
      })
      .join('\n');

    throw new Error(`\n❌ Invalid environment configuration:\n${errorMessages}\n`);
  }

  _config = result.data;
  return result.data;
}

/**
 * Get the loaded environment config.
 * Must call loadEnv() first.
 */
export function getEnv(): EnvConfig {
  if (!_config) {
    throw new Error('Environment not loaded. Call loadEnv() first.');
  }
  return _config;
}

/**
 * Check if the app is in development mode.
 */
export function isDev(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check if the app is in production mode.
 */
export function isProd(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if NVIDIA AI is configured.
 */
export function isAIConfigured(): boolean {
  return !!_config?.NVIDIA_API_KEY;
}
