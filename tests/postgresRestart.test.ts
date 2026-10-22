import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash, randomUUID } from "node:crypto";
import { PostgresStorage } from "../server/postgresStorage";

const run = promisify(execFile);

test("database progress survives real process exits and concurrent separate processes", {
  skip: !process.env.DATABASE_TEST_URL,
}, async () => {
  const id = `session-restart-${randomUUID()}`;
  const key = createHash("sha256").update(id).digest("hex");
  const cleanup = new PostgresStorage(process.env.DATABASE_TEST_URL!);
  const worker = async (action: string) => {
    const source = `
      import { PostgresStorage } from "./server/postgresStorage.ts";
      const storage = new PostgresStorage(process.env.DATABASE_TEST_URL);
      try {
        await storage.initialize();
        const sessionId = process.env.RELEASE_TEST_SESSION;
        ${action}
      } catch {
        console.error("Database release worker failed");
        process.exitCode = 1;
      } finally { await storage.pool.end(); }
    `;
    return run(process.execPath, ["--import", "tsx", "--input-type=module", "-e", source], {
      env: { ...process.env, RELEASE_TEST_SESSION: id },
      timeout: 20_000,
    });
  };
  try {
    await worker(`await storage.saveProgress({
      sessionId, currentPhase: 1, phaseCompletion: {}, classifications: [],
      confidenceLevel: 50, assessmentScores: { classificationAccuracy: 0,
      explanationQuality: 0, boundaryMapCompleteness: 0, circuitCorrectness: 0, calibration: 0 }
    });`);
    await Promise.all([
      worker(`await storage.updateProgress(sessionId, { confidenceLevel: 81, assessmentScores: { classificationAccuracy: 91 } });`),
      worker(`await storage.updateProgress(sessionId, { assessmentScores: { circuitCorrectness: 76 } });`),
    ]);
    const result = await worker(`const saved = await storage.getProgress(sessionId);
      console.log(JSON.stringify({ confidence: saved?.confidenceLevel,
        classification: saved?.assessmentScores.classificationAccuracy,
        circuit: saved?.assessmentScores.circuitCorrectness }));`);
    assert.deepEqual(JSON.parse(result.stdout), { confidence: 81, classification: 91, circuit: 76 });
  } finally {
    await cleanup.pool.query("DELETE FROM agent_learning_sessions WHERE session_key = $1", [key]);
    await cleanup.pool.end();
  }
});
