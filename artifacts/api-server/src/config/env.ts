import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("8080"),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  JWT_REFRESH_REMEMBER_EXPIRY: z.string().default("30d"),
  CORS_ORIGIN: z.string().default("http://localhost:21292"),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),
  ACCOUNT_LOCKOUT_THRESHOLD: z.coerce.number().default(5),
  ACCOUNT_LOCKOUT_DURATION_MS: z.coerce.number().default(900_000),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  APP_URL: z.string().default("http://localhost:21292"),
  API_URL: z.string().default("http://localhost:8080"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("GenZVerse <noreply@genzverse.app>"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  CSRF_SECRET: z.string().min(32).optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment configuration: ${JSON.stringify(formatted)}`);
  }
  const data = parsed.data;
  return {
    ...data,
    GOOGLE_CALLBACK_URL:
      data.GOOGLE_CALLBACK_URL ?? `${data.APP_URL}/api/auth/google/callback`,
  };
}

export const env = loadEnv();
