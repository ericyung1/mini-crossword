import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  OPENAI_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
