import { sql } from "drizzle-orm";
import { text, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "~/server/db/schema";
import { createdAt, updatedAt } from "./util";

const table = pgTableCreator((name) => name);

export const words = table("words", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$default(() => sql`gen_random_uuid()`),
  inGerman: text("in_german").notNull(),
  inEnglish: text("in_english").notNull(),
  exampleUsage: text("example_usage"),
  addedByUserId: text("added_by_user_id")
    .notNull()
    .references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
export const wordSchema = createSelectSchema(words);
export const newWordSchema = createInsertSchema(words).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const usersWords = table(
  "users_words",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wordId: text("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (userWord) => ({
    compoundKey: primaryKey({
      columns: [userWord.userId, userWord.wordId],
    }),
  }),
);

export type UserWord = typeof usersWords.$inferSelect;
export type NewUserWord = typeof usersWords.$inferInsert;
export const userWordSchema = createSelectSchema(usersWords);
export const newUserWordSchema = createInsertSchema(usersWords).omit({
  createdAt: true,
  updatedAt: true,
});
