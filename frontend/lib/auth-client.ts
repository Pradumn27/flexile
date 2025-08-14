import { createAuthClient } from "better-auth/react";
import { extendAuthClientWithCredentials } from "better-auth-custom-credentials";

export const authClient = extendAuthClientWithCredentials(createAuthClient());

export const signOut = async () => {
  await authClient.signOut();
};

export async function signInWithGoogle() {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/oauth_redirect",
  });
}
