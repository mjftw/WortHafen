import jwt from "jsonwebtoken";
import type { ISODateString } from "next-auth";
import { randomBytes } from "crypto";
import { z } from "zod";
import { env } from "~/env";
import { type AuthorizationToken, authorizationTokens } from "../db/schema";
import { getDb } from "../db";
import { Err, Ok, type Result } from "ts-results";

export const accessTokenSchema = z.object({
  userId: z.string(),
});

export type AccessToken = z.infer<typeof accessTokenSchema>;

export interface AccessSession {
  token: AccessToken;
  expires: ISODateString;
}

export function encodeAccessJWT(payload: AccessToken, expiresIn = "1d") {
  return jwt.sign(payload, env.API_JWT_SECRET, {
    expiresIn,
  });
}

export function decodeAccessJWT(
  tokenText: string,
): Result<AccessSession, Error> {
  try {
    const decoded = jwt.verify(tokenText, env.API_JWT_SECRET);

    if (typeof decoded === "string") {
      return Err(new Error("JWT decoded to string"));
    }

    if (!decoded.exp) {
      return Err(new Error("JWT missing exp"));
    }

    const apiToken = accessTokenSchema.safeParse(decoded);
    if (!apiToken.success) {
      return Err(new Error("JWT payload failed validation"));
    }

    const expires = new Date(decoded.exp * 1000).toISOString();

    return Ok({
      token: apiToken.data,
      expires,
    });
  } catch (err) {
    return Err(new Error("Failed to verify and decode JWT", { cause: err }));
  }
}

export async function createAuthorizationToken(
  userId: string,
  expireInMinutes = 2,
): Promise<Result<AuthorizationToken, Error>> {
  const db = await getDb();
  const code = generateRandomCode();
  const expiresAt = new Date(Date.now() + 1000 * 60 * expireInMinutes);
  const [authorizationToken] = await db
    .insert(authorizationTokens)
    .values({
      userId,
      code,
      expiresAt,
    })
    .returning();

  if (!authorizationToken) {
    return Err(new Error("Failed to create authorization token"));
  }

  return Ok(authorizationToken);
}

function generateRandomCode(length = 48) {
  return randomBytes(length).toString("hex");
}
