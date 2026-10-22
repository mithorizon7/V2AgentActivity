import { MemStorage } from "./storage";
import { PostgresStorage } from "./postgresStorage";

export const storage = process.env.DATABASE_URL
  ? new PostgresStorage(process.env.DATABASE_URL)
  : new MemStorage();

export async function initializeStorage() {
  if (storage instanceof PostgresStorage) {
    await storage.initialize();
  } else if (process.env.NODE_ENV === "production" && process.env.ALLOW_EPHEMERAL_STORAGE !== "true") {
    throw new Error("Production requires DATABASE_URL; ephemeral storage is allowed only for explicit local tests");
  }
}

export async function closeStorage() {
  if (storage instanceof PostgresStorage) await storage.pool.end();
}
