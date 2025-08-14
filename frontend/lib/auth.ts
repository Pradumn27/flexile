import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { credentialsPlugin } from "better-auth-custom-credentials";
import { z } from "zod";
import { authenticationSchema } from "@/db/schema";
import env from "@/env";
import { assertDefined } from "@/utils/assert";
import { db } from "../db";

export const auth = betterAuth({
  plugins: [
    nextCookies(),
    credentialsPlugin({
      inputSchema: z.object({
        email: z.email(),
        otp: z.string(),
      }),
      verify: async ({ input: { email, otp }, req }) => {
        try {
          const response = await fetch(`${assertDefined(req.headers.get("origin"))}/internal/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              otp_code: otp,
              token: env.API_SECRET_TOKEN,
            }),
          });

          if (!response.ok) {
            throw new Error(
              z.object({ error: z.string() }).safeParse(await response.json()).data?.error ||
                "Authentication failed, please try again.",
            );
          }

          const data = z
            .object({
              user: z.object({
                id: z.number(),
                email: z.string(),
                name: z.string().nullable(),
                legal_name: z.string().nullable(),
                preferred_name: z.string().nullable(),
              }),
              jwt: z.string(),
            })
            .parse(await response.json());

          return {
            ok: true,
            user: {
              ...data.user,
              id: data.user.id.toString(),
              name: data.user.name ?? "",
              legalName: data.user.legal_name ?? "",
              preferredName: data.user.preferred_name ?? "",
              jwt: data.jwt,
            },
            id: data.user.id.toString(),
            meta: { jwt: data.jwt },
          };
        } catch {
          return {
            ok: false,
            reason: "Authentication failed, please try again.",
            code: "400",
          };
        }
      },
      onSessionData: ({ verified }) => {
        const jwt = verified.meta?.jwt ?? undefined;
        return jwt ? { jwt } : undefined;
      },
    }),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...authenticationSchema,
      user: authenticationSchema.users,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  advanced: {
    database: {
      useNumberId: true,
    },
  },
  session: {
    additionalFields: {
      jwt: {
        type: "string",
        defaultValues: null,
      },
    },
  },
});
