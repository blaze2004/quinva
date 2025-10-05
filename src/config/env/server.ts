import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const serverEnv = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]),
    RESEND_API_KEY: z.string().min(1, "RESEND API key is required"),
  },
  experimental__runtimeEnv: process.env,
});
