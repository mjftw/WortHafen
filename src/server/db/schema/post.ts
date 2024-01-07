import { text, timestamp, pgTableCreator, serial } from "drizzle-orm/pg-core";
import { users } from "~/server/db/schema";

const table = pgTableCreator((name) => name);

export const posts = table("posts", {
  id: serial("id").notNull().primaryKey(),
  name: text("name").notNull(),
  createdByUserId: text("created_by_user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updatedAt"),
});
