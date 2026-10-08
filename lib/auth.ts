import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { db } from "@/lib/db";
import * as authSchema from "@/lib/db/auth-schema";

import type { Role } from "better-auth/plugins/access";

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined),
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db!, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      mustChangePassword: {
        type: "boolean",
        defaultValue: true,
        input: false,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "supervisor",
      adminRole: "admin",
      roles: {
        admin: {} as Role,
        supervisor: {} as Role,
      },
    }),
    nextCookies(),
  ],
  trustedOrigins: [
  process.env.BETTER_AUTH_URL,
  process.env.EXTRA_ORIGIN,
].filter((o): o is string => Boolean(o)),
});
