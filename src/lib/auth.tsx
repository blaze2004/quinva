import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { clientEnv } from "@/config/env/client";
import prisma from "./prisma";
import { resend } from "./resend";
import { EmailVerification } from "@/email/verufy-email";

export const auth = betterAuth({
  baseURL: clientEnv.NEXT_PUBLIC_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "Quinva <no-reply@visualbrahma.tech>",
        to: user.email!,
        subject: "Verify your email",
        text: `Click the link to verify your email: ${url}`,
        react: <EmailVerification url={url} />,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [username(), nextCookies()],
});
