import { clientEnv } from "@/config/env/client";
import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: clientEnv.NEXT_PUBLIC_URL,
  plugins: [usernameClient()],
});
