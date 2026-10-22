import { test } from "node:test";
import assert from "node:assert/strict";
import { MemStorage, SessionCapacityError } from "../server/storage";
import type { InsertProgress } from "../shared/schema";
import { allowedDevelopmentHost } from "../server/security";
import { databaseOptions } from "../server/postgresStorage";

test("development hosts reject unapproved domains and malformed authorities", () => {
  assert(allowedDevelopmentHost("localhost:5000"));
  assert(allowedDevelopmentHost("127.0.0.1:5000"));
  assert(allowedDevelopmentHost("[::1]:5000"));
  for (const host of [undefined, "untrusted.invalid", "localhost.untrusted.invalid", "untrusted@localhost", "localhost/path", "localhost#fragment"]) {
    assert.equal(allowedDevelopmentHost(host), false);
  }
});

const initialProgress = (id: string): InsertProgress => ({
  sessionId: `session-${id}`, currentPhase: 1, phaseCompletion: {}, classifications: [], confidenceLevel: 50,
  assessmentScores: { classificationAccuracy: 0, explanationQuality: 0, boundaryMapCompleteness: 0, circuitCorrectness: 0, calibration: 0 },
});

test("remote database connections enforce TLS certificate verification", () => {
  for (const query of ["?sslmode=require", "?sslmode=disable&ssl=false", "?sslmode=no-verify"]) {
    const options = databaseOptions(`postgresql://user:placeholder@database.example/learning${query}`);
    assert.deepEqual(options.ssl, { rejectUnauthorized: true });
    assert.equal(new URL(options.connectionString!).searchParams.has("sslmode"), false);
  }
  assert.equal(databaseOptions("postgresql://localhost/learning").ssl, false);
  assert.deepEqual(databaseOptions("postgresql://helium.example/learning").ssl, { rejectUnauthorized: true });
  if (process.env.REPL_ID) {
    assert.equal(databaseOptions("postgresql://helium/learning").ssl, false);
  } else {
    assert.deepEqual(databaseOptions("postgresql://helium/learning").ssl, { rejectUnauthorized: true });
  }
  assert.throws(() => databaseOptions("https://database.example/learning"));
});

test("independent activity saves preserve each other's assessment scores", async () => {
  const storage = new MemStorage();
  await storage.saveProgress(initialProgress("scores"));
  await Promise.all([
    storage.updateProgress("session-scores", { assessmentScores: { classificationAccuracy: 80 } }),
    storage.updateProgress("session-scores", { assessmentScores: { circuitCorrectness: 90 } }),
  ]);
  const result = await storage.getProgress("session-scores");
  assert.equal(result?.assessmentScores.classificationAccuracy, 80);
  assert.equal(result?.assessmentScores.circuitCorrectness, 90);
});

test("expired sessions cannot be read or revived by mutation", async (t) => {
  const storage = new MemStorage();
  const record = await storage.saveProgress(initialProgress("expiry"));
  t.mock.method(Date, "now", () => record.updatedAt.getTime() + 24 * 60 * 60 * 1000);
  assert.equal(await storage.getProgress(record.sessionId), undefined);
  assert.equal(await storage.updateProgress(record.sessionId, { confidenceLevel: 100 }), undefined);
});

test("capacity rejects new sessions without dropping existing learners", async () => {
  const storage = new MemStorage();
  for (let index = 0; index < 2048; index++) await storage.saveProgress(initialProgress(String(index)));
  await assert.rejects(storage.saveProgress(initialProgress("overflow")), SessionCapacityError);
  assert(await storage.getProgress("session-0"));
  assert(await storage.getProgress("session-2047"));
});
