import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { db } from "@/lib/db";
import * as authSchema from "@/lib/db/auth-schema";

import type { Role } from "better-auth/plugins/access";

export const auth = betterAuth({
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
});
