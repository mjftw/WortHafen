import jwt from "jsonwebtoken";
import type { ISODateString } from "next-auth";
import { randomBytes } from "crypto";
import { z } from "zod";
import { env } from "~/env";

export const apiUserSchema = z.object({
  clientId: z.string(),
});

export type APIUser = z.infer<typeof apiUserSchema>;

export interface APISession {
  user: APIUser;
  expires: ISODateString;
}

export function createJWT(payload: APIUser) {
  return jwt.sign(payload, env.API_JWT_SECRET, {
    expiresIn: "1d",
  });
}

export function decodeJWT(token: string): APISession | null {
  try {
    const decoded = jwt.verify(token, env.API_JWT_SECRET);

    if (typeof decoded === "string") {
      throw new Error("JWT decoded to string");
    }

    if (!decoded.exp) {
      throw new Error("JWT missing exp");
    }

    const apiUser = apiUserSchema.parse(decoded);
    const expires = new Date(decoded.exp * 1000).toISOString();

    return {
      user: apiUser,
      expires,
    };
  } catch (err) {
    console.error("Failed to verify and decode JWT", err);
    return null;
  }
}

export function newClientSecret(length = 48) {
  return randomBytes(length).toString("hex");
}
