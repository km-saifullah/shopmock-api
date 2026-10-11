import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(8000),

  API_PREFIX: z
    .string()
    .regex(/^\/[a-zA-Z0-9/_-]+$/)
    .default("/v1"),

  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .default("mongodb://127.0.0.1:27017/shopmock"),

  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");

  for (const issue of parsedEnv.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }

  process.exit(1);
}

export const env = Object.freeze(parsedEnv.data);

export type AppEnvironment = typeof env;
