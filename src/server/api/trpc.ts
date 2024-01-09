import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import superjson from "superjson";
import { ZodError } from "zod";
import type { OpenApiMeta } from "trpc-openapi";

import { getServerAuthSession } from "~/server/auth";
import { type Database, getDb } from "~/server/db";
import { decodeAccessJWT } from "~/server/api/oauth";
import { Err, Ok, Result } from "ts-results";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  session: Session | null;
  db: Database;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db: opts.db,
  };
};

async function buildUserSession(
  opts: CreateNextContextOptions,
): Promise<Result<Session | null, Error>> {
  return await Result.wrapAsync(() => getServerAuthSession(opts));
}

async function buildApiSession(
  opts: CreateNextContextOptions,
  db: Database,
): Promise<Result<Session, Error>> {
  const { req } = opts;
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return Err(new Error("No authorization header"));
  }

  const accessSessionResult = decodeAccessJWT(token);

  if (accessSessionResult.err) {
    return Err(
      new Error("Failed to decode JWT", { cause: accessSessionResult.val }),
    );
  }
  const accessSession = accessSessionResult.val;

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, accessSession.token.userId),
  });

  if (!user) {
    return Err(new Error("User not found"));
  }

  return Ok({
    user,
    expires: accessSession.expires,
  });
}

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const db = await getDb();

  const sessionResult =
    (await buildUserSession(opts)) ?? (await buildApiSession(opts, db));

  const session = sessionResult.unwrap();

  return createInnerTRPCContext({
    session,
    db,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createTRPCContext>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
