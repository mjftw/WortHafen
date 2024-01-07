import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hello",
      },
    })
    .input(z.object({ text: z.string() }))
    .output(z.object({ greeting: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/post",
        protect: true,
      },
    })
    .input(z.object({ name: z.string().min(1) }))
    .output(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .insert(posts)
        .values({
          name: input.name,
          createdByUserId: ctx.session.user.id,
        })
        .returning();

      if (!post) {
        throw new Error("Failed to create post");
      }

      return {
        id: post.id,
      };
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
