import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";

test("production refuses silent in-memory storage fallback", async () => {
  const child = spawn(process.execPath, ["dist/index.js"], {
    cwd: process.env.SECURITY_TEST_APP_ROOT || process.cwd(),
    env: { PATH: process.env.PATH, NODE_ENV: "production", PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (data) => { output += data; });
  child.stderr.on("data", (data) => { output += data; });
  const deadline = setTimeout(() => child.kill("SIGKILL"), 10_000);
  try {
    const [code] = await once(child, "exit");
    assert.equal(code, 1);
    assert.doesNotMatch(output, /serving on port/);
    assert.match(output, /Application startup failed/);
  } finally {
    clearTimeout(deadline);
  }
});

test("built production server enforces security boundaries", async (t) => {
  let logs = "";
  const child = spawn(process.execPath, ["dist/index.js"], {
    cwd: process.env.SECURITY_TEST_APP_ROOT || process.cwd(),
    env: { PATH: process.env.PATH, NODE_ENV: "production", PORT: "0", ALLOW_EPHEMERAL_STORAGE: "true" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(async () => {
    if (child.exitCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
  });
  child.stderr.on("data", (data) => { logs += data; });
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Server startup timed out")), 10_000);
    child.once("error", reject);
    child.once("exit", () => {
      clearTimeout(timer);
      reject(new Error("Server exited before readiness"));
    });
    child.stdout.on("data", (data) => {
      logs += data;
      const match = logs.match(/serving on port (\d+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  const base = `http://127.0.0.1:${port}`;
  const post = (path, body, extra = {}) => fetch(base + path, {
    method: "POST",
    headers: { "X-Requested-With": "AgentLearning", "Content-Type": "application/json", ...extra },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let sessionId;

  await t.test("production page has restrictive headers and no dev tooling", async () => {
    const res = await fetch(base);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-security-policy"), /script-src 'self'/);
    assert.match(res.headers.get("content-security-policy"), /frame-ancestors 'none'/);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-powered-by"), null);
    assert.doesNotMatch(await res.text(), /@vite\/client|runtime-error-modal/);
  });
  await t.test("only explicit same-origin POST requests create sessions", async () => {
    assert.equal((await fetch(base + "/api/session/create")).status, 405);
    assert.equal((await fetch(base + "/api/session/create", { method: "POST" })).status, 403);
    assert.equal((await post("/api/session/create", undefined, { "Sec-Fetch-Site": "cross-site" })).status, 403);
    const res = await post("/api/session/create");
    assert.equal(res.status, 200);
    sessionId = (await res.json()).sessionId;
    assert.match(sessionId, /^session-[0-9a-f-]{36}$/);
  });
  await t.test("progress uses a header bearer token and unknown sessions cannot read data", async () => {
    assert.equal((await fetch(base + "/api/progress")).status, 401);
    assert.equal((await fetch(base + "/api/progress", { headers: { Authorization: sessionId } })).status, 401);
    assert.equal((await fetch(base + "/api/progress", { headers: { Authorization: "Bearer session-does-not-exist" } })).status, 404);
    const res = await fetch(base + "/api/progress", { headers: { Authorization: `Bearer ${sessionId}` } });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal((await res.json()).sessionId, sessionId);
    assert.equal((await fetch(base + `/api/progress/${sessionId}`)).status, 404);
  });
  await t.test("full-record overwrites are disabled", async () => {
    assert.equal((await post("/api/progress", { sessionId, assessmentScores: { calibration: 100 } })).status, 405);
  });
  await t.test("malformed, compressed, non-JSON and oversized payloads are rejected without echo", async () => {
    const bad = await fetch(base + "/api/classify", {
      method: "POST", headers: { "X-Requested-With": "AgentLearning", "Content-Type": "application/json" },
      body: '{"secret-marker":',
    });
    assert.equal(bad.status, 400);
    assert.doesNotMatch(await bad.text(), /secret-marker|SyntaxError|stack/);
    assert.equal(bad.headers.get("x-content-type-options"), "nosniff");
    assert.equal((await post("/api/classify", {}, { "Content-Encoding": "br" })).status, 415);
    assert.equal((await post("/api/classify", {}, { "Content-Type": "text/plain" })).status, 415);
    assert.equal((await post("/api/classify", { text: "x".repeat(140_000) })).status, 413);
  });
  await t.test("classification rejects duplicate/unknown IDs and validates server-side scores", async () => {
    const submission = { itemId: "save_preferences", selectedProcess: "learning", explanation: "private-learner-marker" };
    assert.equal((await post("/api/classify", { sessionId, submissions: [submission, submission], confidence: 50 })).status, 400);
    assert.equal((await post("/api/classify", { sessionId, submissions: [{ ...submission, itemId: "unknown" }], confidence: 50 })).status, 400);
    assert.equal((await post("/api/classify", { sessionId, submissions: [{ ...submission, explanation: "x".repeat(4001) }], confidence: 50 })).status, 400);
    const valid = await post("/api/classify", { sessionId, submissions: [submission], confidence: 50 });
    assert.equal(valid.status, 200);
    assert.equal((await valid.json()).accuracy, 100);
  });
  await t.test("graph APIs reject dangling, duplicate and unbounded input", async () => {
    const element = { id: "sensor", label: "Sensor", type: "sensor", x: 0, y: 0 };
    assert.equal((await post("/api/boundary-map", { sessionId, elements: [element], connections: [{ id: "c", elementId: "missing", process: "perception" }] })).status, 400);
    assert.equal((await post("/api/boundary-map", { sessionId, elements: [element, element], connections: [] })).status, 400);
    assert.equal((await post("/api/boundary-map", { sessionId, elements: Array(65).fill(element), connections: [] })).status, 400);
    assert.equal((await post("/api/boundary-map", { sessionId, elements: [element], connections: [] })).status, 200);
    assert.equal((await post("/api/circuit", { sessionId, blocks: [], connections: [{ id: "c", from: "a", to: "a" }] })).status, 400);
  });
  await t.test("simulation uses valid sessions/slots and reports missing-tool failures", async () => {
    const config = { sessionId, blockIds: { perception: "perception.smooth", reasoning: "reasoning.threshold", planning: "planning.daily", execution: "execution.notify" }, fixtureId: "fixture-normal" };
    assert.equal((await post("/api/simulate", { ...config, sessionId: "session-does-not-exist" })).status, 404);
    assert.equal((await post("/api/simulate", { ...config, blockIds: { ...config.blockIds, perception: "planning.daily" } })).status, 400);
    const normal = await post("/api/simulate", config);
    assert.equal(normal.status, 200);
    const result = await normal.json();
    assert.equal(result.success, true);
    assert.equal(result.steps[0].blockId, "START_PERCEPTION");
    const failed = await post("/api/simulate", { ...config, failureConfig: { missingTool: "sendNotification" } });
    const failure = await failed.json();
    assert.equal(failure.success, false);
    assert(failure.steps.some((step) => step.status === "error" && step.blockId.includes("EXECUTION")));
    assert(!failure.steps.some((step) => step.blockId === "END_EXECUTION"));
    const progress = await fetch(base + "/api/progress", { headers: { Authorization: `Bearer ${sessionId}` } });
    assert.equal((await progress.json()).simulationResults.length, failure.steps.length);
  });
  await t.test("session creation rate is bounded", async () => {
    let res;
    for (let index = 0; index < 121; index++) {
      res = await post("/api/session/create");
      await res.arrayBuffer();
      if (res.status === 429) break;
    }
    assert.equal(res.status, 429);
    assert(Number(res.headers.get("retry-after")) > 0);
  });
  await t.test("logs exclude credentials and learner content", () => {
    assert(!logs.includes(sessionId));
    assert.doesNotMatch(logs, /private-learner-marker|secret-marker|Authorization/);
  });
});
