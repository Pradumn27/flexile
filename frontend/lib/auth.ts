import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { authenticationSchema } from "@/db/schema";
import { db } from "../db";

export const auth = betterAuth({
  plugins: [nextCookies()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...authenticationSchema,
      user: authenticationSchema.users,
    },
  }),
  socialProviders: {
    google: {
      clientId: "1042289818132-kvgppm7d8llssqflk4ka4k972irb36kj.apps.googleusercontent.com",
      clientSecret: "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",
    },
  },
});
