import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { nextCookies, toNextJsHandler } from "better-auth/next-js";
import { Pool } from "pg";
import env from "@/env";

export const auth = betterAuth({
  adapter: memoryAdapter({}),
  database: new Pool({
    connectionString: env.DATABASE_URL,
  }),
  emailVerification: {
    autoSignInAfterVerification: true, // Crucial for automatically signing in after verification
  },
  plugins: [nextCookies()],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});

export const handler = toNextJsHandler(auth);
