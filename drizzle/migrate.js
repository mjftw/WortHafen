import { migrate } from "drizzle-orm/node-postgres/migrator";

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const isProduction = process.env.NODE_ENV === "production";

const databaseUrl = new URL(process.env.DATABASE_URL);
if (isProduction) {
  databaseUrl.searchParams.append("sslmode", "require");
}

const sslConfig = isProduction ? { ssl: { rejectUnauthorized: true } } : {};

const client = new Client({
  connectionString: databaseUrl.toString(),
  ...sslConfig,
});

await client.connect();

const db = drizzle(client);

console.log("Applying database migrations...");

await migrate(db, { migrationsFolder: "drizzle" }).then(() => {
  console.log("✅ Database migrated successfully");
});

process.exit(0);
