import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { PostgresStorage } from "../server/postgresStorage";

test("PostgreSQL survives reconnects and merges concurrent activity updates", { skip: !process.env.DATABASE_TEST_URL }, async (t) => {
  const url = process.env.DATABASE_TEST_URL!;
  const first = new PostgresStorage(url);
  const second = new PostgresStorage(url);
  const sessionId = `session-test-${randomUUID()}`;
  const key = createHash("sha256").update(sessionId).digest("hex");
  t.after(async () => {
    await second.pool.query("DELETE FROM agent_learning_sessions WHERE session_key = $1", [key]);
    await Promise.all([first.pool.end(), second.pool.end()]);
  });
  await first.initialize();
  await second.initialize();
  await first.saveProgress({ sessionId, currentPhase: 1, phaseCompletion: {}, classifications: [], confidenceLevel: 50,
    assessmentScores: { classificationAccuracy: 0, explanationQuality: 0, boundaryMapCompleteness: 0, circuitCorrectness: 0, calibration: 0 } });
  assert.equal((await second.getProgress(sessionId))?.confidenceLevel, 50);
  await Promise.all([
    first.updateProgress(sessionId, { confidenceLevel: 80, assessmentScores: { classificationAccuracy: 90 } }),
    second.updateProgress(sessionId, { assessmentScores: { circuitCorrectness: 75 } }),
  ]);
  const reconnected = new PostgresStorage(url);
  try {
    const saved = await reconnected.getProgress(sessionId);
    assert.equal(saved?.confidenceLevel, 80);
    assert.equal(saved?.assessmentScores.classificationAccuracy, 90);
    assert.equal(saved?.assessmentScores.circuitCorrectness, 75);
    const row = await reconnected.pool.query("SELECT data::text FROM agent_learning_sessions WHERE session_key = $1", [key]);
    assert(!row.rows[0].data.includes(sessionId));
    await reconnected.pool.query("UPDATE agent_learning_sessions SET updated_at = now() - interval '25 hours' WHERE session_key = $1", [key]);
    assert.equal(await second.getProgress(sessionId), undefined);
    assert.equal(await first.updateProgress(sessionId, { confidenceLevel: 100 }), undefined);
  } finally {
    await reconnected.pool.end();
  }
});
