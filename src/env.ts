import { z } from "zod";

// Server-only environment variables schema
// NEVER expose secrets via NEXT_PUBLIC_* variables
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  OPENAI_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
});

// Validate and parse server environment variables
// This will fail-fast if required variables are missing or invalid
function createEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  
  return parsed.data;
}

// Export server-only environment variables
// This object should NEVER be used in client-side code
export const env = createEnv();

export type ServerEnv = z.infer<typeof serverEnvSchema>;
