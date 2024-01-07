import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { env } from "~/env";
import { Client } from "pg";
import * as schema from "~/server/db/schema";

export type Database = NodePgDatabase<typeof schema>;

class DatabaseSingleton {
  private static instance: Database | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static async getInstance(): Promise<Database> {
    if (!this.instance) {
      this.instance = await setupDb();
    }
    return this.instance;
  }
}

async function setupDb(): Promise<Database> {
  const databaseUrl = new URL(env.DATABASE_URL);
  if (env.POSTGRES_USE_SSL) {
    databaseUrl.searchParams.append("sslmode", "require");
  }

  const sslConfig = env.POSTGRES_USE_SSL
    ? { ssl: { rejectUnauthorized: true } }
    : {};

  const client = new Client({
    connectionString: databaseUrl.toString(),
    ...sslConfig,
  });

  await client.connect();

  const drizzleDb = drizzle(client, { schema });

  return drizzleDb;
}

export async function getDb(): Promise<Database> {
  return DatabaseSingleton.getInstance();
}
