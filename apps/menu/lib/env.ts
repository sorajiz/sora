import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default("assets"),
  R2_PUBLIC_BASE_URL: z.string().default("https://assets.sorae.tokyo"),
  NEXT_PUBLIC_MENU_BASE_URL: z.string().default("https://menu.sorae.tokyo"),
  DISCORD_CLIENT_ID: z.string().regex(/^\d{17,20}$/, "DISCORD_CLIENT_ID must be a 17-20 digit snowflake string"),
  DISCORD_CLIENT_SECRET: z.string().min(1, "DISCORD_CLIENT_SECRET is required"),
  DISCORD_OAUTH_REDIRECT_URI: z.string().url().default("https://menu.sorae.tokyo/api/auth/discord/callback"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  PADE_OWNER_DISCORD_ID: z.string().regex(/^\d{17,20}$/, "PADE_OWNER_DISCORD_ID must be a 17-20 digit snowflake string"),
  MENU_INTERNAL_API_SECRET: z.string().min(16).default("dev-menu-internal-secret-min-16"),
  MENU_INTERNAL_API_SECRET_PREVIOUS: z.string().optional(),
  MENU_LIVE_SYNC: z.enum(["off", "poll", "push"]).default("poll"),
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

export function getEnv(): Env {
  if (parsedEnv) return parsedEnv;

  const result = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
    NEXT_PUBLIC_MENU_BASE_URL: process.env.NEXT_PUBLIC_MENU_BASE_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "1559780431161729166",
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || "dev_client_secret_placeholder",
    DISCORD_OAUTH_REDIRECT_URI: process.env.DISCORD_OAUTH_REDIRECT_URI || "http://localhost:3000/api/auth/discord/callback",
    SESSION_SECRET: process.env.SESSION_SECRET || "dev-session-secret-at-least-32-characters-long!",
    PADE_OWNER_DISCORD_ID: process.env.PADE_OWNER_DISCORD_ID || "386528085681635328",
    MENU_INTERNAL_API_SECRET: process.env.MENU_INTERNAL_API_SECRET || "dev-internal-secret-key-16",
    MENU_INTERNAL_API_SECRET_PREVIOUS: process.env.MENU_INTERNAL_API_SECRET_PREVIOUS,
    MENU_LIVE_SYNC: process.env.MENU_LIVE_SYNC || "poll",
    SENTRY_DSN: process.env.SENTRY_DSN,
  });

  if (!result.success) {
    const errorDetails = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
    if (process.env.NODE_ENV === "production") {
      throw new Error(`[FATAL] Invalid environment configuration: ${errorDetails}`);
    } else {
      console.warn(`[WARN] Development environment validation warnings: ${errorDetails}`);
    }
    // For local dev fallback
    parsedEnv = process.env as unknown as Env;
  } else {
    parsedEnv = result.data;
  }

  return parsedEnv;
}
