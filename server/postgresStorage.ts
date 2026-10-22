import { createHash } from "node:crypto";
import pg from "pg";
import type { InsertProgress, LearnerProgress } from "../shared/schema";
import { MemStorage, SessionCapacityError, type ProgressUpdates } from "./storage";

type SessionRow = { data: Omit<LearnerProgress, "sessionId" | "createdAt" | "updatedAt">; created_at: Date; updated_at: Date };
const keyFor = (sessionId: string) => createHash("sha256").update(sessionId).digest("hex");

export function databaseOptions(connectionString: string): pg.PoolConfig {
  const url = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("PostgreSQL URL required");
  // Helium is Replit's platform-local PostgreSQL sidecar, not a remote TLS
  // service. Limit that exception to the exact hostname inside Replit.
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    || (Boolean(process.env.REPL_ID) && url.hostname === "helium");
  // pg connection-string SSL options must not override certificate verification.
  for (const option of ["sslmode", "ssl", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(option);
  return {
    connectionString: url.toString(), ssl: local ? false : { rejectUnauthorized: true },
    max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30_000,
    statement_timeout: 10_000, query_timeout: 12_000,
  };
}

export class PostgresStorage extends MemStorage {
  readonly pool: pg.Pool;

  constructor(connectionString: string) {
    super();
    this.pool = new pg.Pool(databaseOptions(connectionString));
    this.pool.on("error", () => console.error("Database connection error"));
  }

  async initialize() {
    // Schema is prepared in development and promoted by Replit's Publish flow.
    // Fail closed if the deployed schema/database is unavailable; never run DDL here.
    await this.pool.query("SELECT session_key, data, created_at, updated_at FROM agent_learning_sessions LIMIT 0");
    await this.pool.query("DELETE FROM agent_learning_sessions WHERE updated_at <= now() - interval '24 hours'");
  }

  private progress(sessionId: string, row: SessionRow): LearnerProgress {
    return { ...row.data, sessionId, createdAt: row.created_at, updatedAt: row.updated_at };
  }

  override async getProgress(sessionId: string): Promise<LearnerProgress | undefined> {
    const { rows } = await this.pool.query<SessionRow>(
      "SELECT data, created_at, updated_at FROM agent_learning_sessions WHERE session_key = $1 AND updated_at > now() - interval '24 hours'", [keyFor(sessionId)],
    );
    return rows[0] ? this.progress(sessionId, rows[0]) : undefined;
  }

  override async saveProgress(progress: InsertProgress): Promise<LearnerProgress> {
    const { sessionId, ...data } = progress;
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      // Serialize capacity checks across Autoscale instances without evicting active work.
      await client.query("SELECT pg_advisory_xact_lock(718924611)");
      await client.query("DELETE FROM agent_learning_sessions WHERE updated_at <= now() - interval '24 hours'");
      const { rows } = await client.query<SessionRow>(`INSERT INTO agent_learning_sessions (session_key, data)
        SELECT $1, $2::jsonb WHERE (SELECT count(*) FROM agent_learning_sessions) < 2048
          OR EXISTS (SELECT 1 FROM agent_learning_sessions WHERE session_key = $1)
        ON CONFLICT (session_key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
        RETURNING data, created_at, updated_at`, [keyFor(sessionId), JSON.stringify(data)]);
      if (!rows[0]) throw new SessionCapacityError("Session capacity reached");
      await client.query("COMMIT");
      return this.progress(sessionId, rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  override async updateProgress(sessionId: string, updates: ProgressUpdates): Promise<LearnerProgress | undefined> {
    const { assessmentScores, ...fields } = updates;
    // One atomic update preserves other activities' scores during concurrent saves.
    const { rows } = await this.pool.query<SessionRow>(`UPDATE agent_learning_sessions SET
      data = data || $2::jsonb || jsonb_build_object('assessmentScores', (data->'assessmentScores') || $3::jsonb),
      updated_at = now()
      WHERE session_key = $1 AND updated_at > now() - interval '24 hours'
      RETURNING data, created_at, updated_at`, [keyFor(sessionId), JSON.stringify(fields), JSON.stringify(assessmentScores ?? {})]);
    return rows[0] ? this.progress(sessionId, rows[0]) : undefined;
  }
}
