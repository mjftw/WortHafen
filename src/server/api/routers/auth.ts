import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createJWT } from "~/server/api/apiAuth";

export const authRouter = createTRPCRouter({
  token: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/token",
        tags: ["Auth"],
        protect: true,
      },
    })
    .input(z.object({ clientId: z.string() }))
    .output(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const token = createJWT({ clientId: input.clientId });

      return { token };
    }),
});
