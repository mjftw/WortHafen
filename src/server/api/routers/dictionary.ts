import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  newWordSchema,
  wordSchema,
  words,
} from "~/server/db/schema/dictionary";

export const dictionaryRouter = createTRPCRouter({
  findGerman: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/word/german/:inGerman",
        tags: ["Dictionary"],
      },
    })
    .input(z.object({ inGerman: z.string() }))
    .output(z.object({ found: z.array(wordSchema) }))
    .query(async ({ input, ctx }) => {
      const found = await ctx.db
        .select()
        .from(words)
        .where(eq(words.inGerman, input.inGerman));

      return { found };
    }),
  findEnglish: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/word/english/:inEnglish",
        tags: ["Dictionary"],
      },
    })
    .input(z.object({ inEnglish: z.string() }))
    .output(z.object({ found: z.array(wordSchema) }))
    .query(async ({ input, ctx }) => {
      const found = await ctx.db
        .select()
        .from(words)
        .where(eq(words.inEnglish, input.inEnglish));

      return { found };
    }),
  create: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/word",
        tags: ["Dictionary"],
        protect: true,
      },
    })
    .input(newWordSchema.omit({ addedByUserId: true }))
    .output(wordSchema)
    .mutation(async ({ ctx, input }) => {
      const [word] = await ctx.db
        .insert(words)
        .values({
          inGerman: input.inGerman,
          inEnglish: input.inEnglish,
          exampleUsage: input.exampleUsage,
          addedByUserId: ctx.session.user.id as string | undefined,
        })
        .returning();

      if (!word) {
        throw new Error("Failed to create dictionary entry");
      }

      return word;
    }),
});
