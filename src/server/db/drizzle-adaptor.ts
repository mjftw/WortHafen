import { and, eq } from "drizzle-orm";
import { type PgDatabase } from "drizzle-orm/pg-core";

import * as schema from "./schema";
import type { Adapter } from "next-auth/adapters";

export function createTables() {
  const users = schema.users;
  const accounts = schema.accounts;
  const sessions = schema.sessions;
  const verificationTokens = schema.verificationTokens;

  return { users, accounts, sessions, verificationTokens };
}

export type DefaultSchema = ReturnType<typeof createTables>;

export function pgDrizzleAdapter(
  client: InstanceType<typeof PgDatabase>,
): Adapter {
  const { users, accounts, sessions, verificationTokens } = createTables();

  return {
    async createUser(user): Promise<schema.User> {
      return await client
        .insert(users)
        .values(user)
        .returning()
        .then((res) => {
          const user = res[0];
          if (!user) {
            throw new Error("Failed to create user");
          }

          return user;
        });
    },
    async getUser(userId) {
      return await client
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .then((res) => res[0] ?? null);
    },
    async getUserByEmail(email) {
      return await client
        .select()
        .from(users)
        .where(eq(users.email, email))
        .then((res) => res[0] ?? null);
    },
    async createSession(session) {
      return await client
        .insert(sessions)
        .values(session)
        .returning()
        .then((res) => {
          const session = res[0];
          if (!session) {
            throw new Error("Failed to create session");
          }

          return session;
        });
    },
    async getSessionAndUser(sessionToken) {
      return await client
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .innerJoin(users, eq(users.id, sessions.userId))
        .then((res) => res[0] ?? null);
    },
    async updateUser(user) {
      return await client
        .update(users)
        .set(user)
        .where(eq(users.id, user.id))
        .returning()
        .then((res) => {
          const user = res[0];
          if (!user) {
            throw new Error("Failed to update user");
          }

          return user;
        });
    },
    async updateSession(data) {
      return await client
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .returning()
        .then((res) => res[0]);
    },
    async linkAccount(rawAccount) {
      const updatedAccount = await client
        .insert(accounts)
        .values(rawAccount)
        .returning()
        .then((res) => {
          const account = res[0];
          if (!account) {
            throw new Error("Failed to link account");
          }

          return account;
        });

      // Drizzle will return `null` for fields that are not defined.
      // However, the return type is expecting `undefined`.
      const account = {
        ...updatedAccount,
        access_token: updatedAccount.access_token ?? undefined,
        token_type:
          (updatedAccount.token_type as "bearer" | "dpop") ?? undefined,
        id_token: updatedAccount.id_token ?? undefined,
        refresh_token: updatedAccount.refresh_token ?? undefined,
        scope: updatedAccount.scope ?? undefined,
        expires_at: updatedAccount.expires_at ?? undefined,
        session_state: updatedAccount.session_state ?? undefined,
      };

      return account;
    },
    async getUserByAccount(account) {
      const dbAccount =
        (await client
          .select()
          .from(accounts)
          .where(
            and(
              eq(accounts.providerAccountId, account.providerAccountId),
              eq(accounts.provider, account.provider),
            ),
          )
          .leftJoin(users, eq(accounts.userId, users.id))
          .then((res) => res[0])) ?? null;

      if (!dbAccount) {
        return null;
      }

      return dbAccount.users;
    },
    async deleteSession(sessionToken) {
      const session = await client
        .delete(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .returning()
        .then((res) => res[0] ?? null);

      return session;
    },
    async createVerificationToken(token) {
      return await client
        .insert(verificationTokens)
        .values(token)
        .returning()
        .then((res) => res[0]);
    },
    async useVerificationToken(token) {
      try {
        return await client
          .delete(verificationTokens)
          .where(
            and(
              eq(verificationTokens.identifier, token.identifier),
              eq(verificationTokens.token, token.token),
            ),
          )
          .returning()
          .then((res) => res[0] ?? null);
      } catch (err) {
        throw new Error("No verification token found.");
      }
    },
    async deleteUser(id) {
      await client
        .delete(users)
        .where(eq(users.id, id))
        .returning()
        .then((res) => res[0] ?? null);
    },
    async unlinkAccount(account) {
      const { type, provider, providerAccountId, userId } = await client
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider),
          ),
        )
        .returning()
        .then((res) => {
          const account = res[0];
          if (!account) {
            throw new Error("Failed to unlink account");
          }

          return account;
        });

      return { provider, type, providerAccountId, userId };
    },
  };
}
