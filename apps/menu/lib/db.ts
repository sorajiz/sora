import { Pool, PoolClient } from "pg";
import { getEnv } from "./env";

let pool: Pool | null = null;
let encodingChecked = false;

export function getDbPool(): Pool {
  if (!pool) {
    const env = getEnv();
    const connStr = env.DATABASE_URL;

    pool = new Pool({
      connectionString: connStr,
      ssl: connStr.includes("sslmode=require") || connStr.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
      max: 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      console.error("[PostgreSQL Pool Error]:", err);
    });
  }
  return pool;
}

/**
 * Asserts that the database server encoding is UTF8 (§S4)
 */
export async function assertUtf8Encoding(): Promise<boolean> {
  if (encodingChecked) return true;
  try {
    const rows = await query<{ server_encoding: string }>("SHOW server_encoding;");
    const encoding = rows[0]?.server_encoding;
    if (encoding && encoding.toUpperCase() !== "UTF8") {
      throw new Error(`[FATAL] Database server_encoding is '${encoding}', expected 'UTF8'`);
    }
    encodingChecked = true;
    return true;
  } catch (err: any) {
    console.warn("[DB Encoding Check Warning]:", err.message);
    return false;
  }
}

/**
 * Direct parameterized query (PgBouncer transaction-mode safe, no named prepared statements)
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getDbPool();
  const res = await p.query(text, params);
  return res.rows;
}

/**
 * Single-connection transaction runner with actor session propagation (§S7)
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
  actorContext?: { actorId: string; source: "WEBSITE" | "DISCORD" | "SYSTEM"; traceId: string }
): Promise<T> {
  const p = getDbPool();
  const client = await p.connect();
  try {
    await client.query("BEGIN;");
    if (actorContext) {
      // Set local transaction context for audit triggers / outbox
      await client.query(`
        SET LOCAL pade.actor_id = '${actorContext.actorId.replace(/'/g, "''")}';
        SET LOCAL pade.source = '${actorContext.source}';
        SET LOCAL pade.trace_id = '${actorContext.traceId.replace(/'/g, "''")}';
      `);
    }
    const result = await callback(client);
    await client.query("COMMIT;");
    return result;
  } catch (err) {
    await client.query("ROLLBACK;");
    throw err;
  } finally {
    client.release();
  }
}
