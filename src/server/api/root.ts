import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import { dictionaryRouter } from "./routers/dictionary";
import { authRouter } from "./routers/auth";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  dictionary: dictionaryRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
