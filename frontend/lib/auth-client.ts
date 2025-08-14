import { createAuthClient } from "better-auth/react";
import { extendAuthClientWithCredentials } from "better-auth-custom-credentials";

export const authClient = extendAuthClientWithCredentials(createAuthClient());

export const signInWithGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/",
  });
};

export const signOut = async () => {
  await authClient.signOut();
};
