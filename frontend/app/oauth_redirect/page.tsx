import { eq } from "drizzle-orm";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { session } from "@/db/schema";
import { auth } from "@/lib/auth";
import { oauth_index_url } from "@/utils/routes";

export default async function PostSignInPage() {
  await updateJWTInOAuth();
  redirect("/");
}

export const updateJWTInOAuth = async () => {
  const authSession = await auth.api.getSession({ headers: await nextHeaders() });

  const email = authSession?.user.email;
  if (!email) throw new Error("Missing email from social session");

  const res = await fetch(oauth_index_url(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
    }),
  });

  if (!res.ok) throw new Error("Rails OAuth link failed");

  const { jwt } = await res.json();

  await db
    .update(session)
    .set({
      jwt,
    })
    .where(eq(session.id, BigInt(authSession.session.id)));
};
