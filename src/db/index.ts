import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __forgesmithDb?: Db | null;
};

function createDb(): Db | null {
  if (!databaseUrl) {
    console.warn("[db] DATABASE_URL is not set — persistence is disabled");
    return null;
  }
  const pool = new Pool({ connectionString: databaseUrl });
  return drizzle(pool, { schema });
}

/**
 * `db` is `null` when DATABASE_URL is not configured (e.g. a quick local run
 * without PostgreSQL). All routes guard for that and degrade gracefully.
 */
export const db: Db | null =
  process.env.NODE_ENV !== "production"
    ? (globalForDb.__forgesmithDb ??= createDb())
    : createDb();
