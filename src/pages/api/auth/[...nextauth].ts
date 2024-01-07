import NextAuth from "next-auth";
import type { NextRequest, NextResponse } from "next/server";

import { authOptions } from "~/server/auth";
import { getDb } from "~/server/db";

export default async function handler(req: NextRequest, res: NextResponse) {
  const db = await getDb();
  const options = await authOptions(db);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const handler = NextAuth(options);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return handler(req, res);
}
