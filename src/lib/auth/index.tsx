import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { clientEnv } from "@/config/env/client";
import ResetPassword from "@/email/reset-password";
import { EmailVerification } from "@/email/verify-email";
import prisma from "../prisma";
import { resend } from "../resend";

export const auth = betterAuth({
  baseURL: clientEnv.NEXT_PUBLIC_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const { error } = await resend.emails.send({
        from: "Quinva <no-reply@quinva.visualbrahma.tech>",
        to: user.email!,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
        react: <ResetPassword url={url} />,
      });

      if (error) {
        throw new Error("Failed to send reset password email");
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { error } = await resend.emails.send({
        from: "Quinva <no-reply@quinva.visualbrahma.tech>",
        to: user.email!,
        subject: "Verify your email",
        text: `Click the link to verify your email: ${url}`,
        react: <EmailVerification url={url} />,
      });

      if (error) {
        throw new Error("Failed to send verification email");
      }
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [username(), nextCookies()],
});
