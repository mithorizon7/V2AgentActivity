import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { PostgresStorage } from "../server/postgresStorage";

test("storage startup validates the existing schema without running DDL", async () => {
  const storage = new PostgresStorage("postgresql://localhost/unused");
  const statements: string[] = [];
  storage.pool.query = (async (statement: string) => {
    statements.push(statement);
    return { rows: [] };
  }) as typeof storage.pool.query;
  try {
    await storage.initialize();
    assert.match(statements[0], /^SELECT /);
    assert(!statements.some((statement) => /\b(CREATE|ALTER|DROP)\b/i.test(statement)));
  } finally {
    await storage.pool.end();
  }
});

test("packaged production runtime meets the release minimum", () => {
  const result = spawnSync("dist/node-runtime/node", ["scripts/check-runtime.mjs"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

test("database connection failure cannot silently enable production memory storage", () => {
  const result = spawnSync("dist/node-runtime/node", ["dist/index.js"], {
    env: {
      PATH: process.env.PATH,
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://localhost:1/unreachable",
      PORT: "0",
    },
    encoding: "utf8",
    timeout: 15_000,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Application startup failed/);
  assert.doesNotMatch(result.stdout, /serving on port/);
  assert.doesNotMatch(result.stderr, /postgresql:\/\//);
});
