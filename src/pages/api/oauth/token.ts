import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "~/server/db";
import { authorizationTokens } from "~/server/db/schema";
import { encodeAccessJWT, type AccessToken } from "~/server/api/oauth";
import { eq } from "drizzle-orm";

export default async function token(req: NextApiRequest, res: NextApiResponse) {
  console.log("token request: ", JSON.stringify(req.body, null, 2));

  // TODO: Make this less rubbish
  // Also need to check that this is how the code is sent, not in query params or something
  const { code } = req.body as { code: string };

  if (!code) {
    res.status(400).json({ error: "Authorization code is required" });
    return;
  }

  const db = await getDb();
  const [authorizationToken] = await db
    .delete(authorizationTokens)
    .where(eq(authorizationTokens.code, code))
    .returning();

  if (!authorizationToken) {
    res.status(400).json({ error: "Invalid authorization code" });
    return;
  }

  if (new Date(authorizationToken.expiresAt) > new Date()) {
    res.status(400).json({ error: "Authorization code has expired" });
    return;
  }

  const accessToken: AccessToken = {
    userId: authorizationToken.userId,
  };
  const jwt = encodeAccessJWT(accessToken);

  res.status(200).json({ access_token: jwt, token_type: "Bearer" });
}
