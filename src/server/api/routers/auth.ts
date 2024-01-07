import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { createJWT, newClientSecret } from "~/server/api/apiAuth";
import { clientCredentials, clientCredentialsSchema } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  clientCredentials: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/client-credentials",
        tags: ["Auth"],
        protect: true,
      },
    })
    .input(z.undefined())
    .output(clientCredentialsSchema)
    .mutation(async ({ ctx }) => {
      const clientSecret = newClientSecret();
      const [credentials] = await ctx.db
        .insert(clientCredentials)
        .values([{ clientId: ctx.session.user.id, clientSecret }])
        .onConflictDoUpdate({
          set: {
            clientSecret,
          },
          target: clientCredentials.clientId,
        })
        .returning();

      if (!credentials) {
        throw new Error("Failed to create client credentials");
      }

      return credentials;
    }),
  token: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/token",
        tags: ["Auth"],
      },
    })
    .input(clientCredentialsSchema)
    .output(z.object({ token: z.string() }))
    .query(async ({ input, ctx }) => {
      const credentials = await ctx.db.query.clientCredentials.findFirst({
        where: (cc, { eq, and }) =>
          and(
            eq(cc.clientId, input.clientId),
            eq(cc.clientSecret, input.clientSecret),
          ),
      });

      if (!credentials) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const token = createJWT({ clientId: credentials.clientId });

      return { token };
    }),
});
