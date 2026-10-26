import { test } from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { createReadinessHandler } from "../server/readiness";

function response() {
  const result = { status: 200, body: undefined as unknown, headers: {} as Record<string, string> };
  const res = {
    setHeader(key: string, value: string) { result.headers[key] = value; },
    status(status: number) { result.status = status; return this; },
    json(body: unknown) { result.body = body; return this; },
  } as unknown as Response;
  return { result, res };
}

test("readiness coalesces probes, bounds caching and reports only state transitions", async () => {
  let time = 0;
  let calls = 0;
  let fail = false;
  const reports: boolean[] = [];
  const probe = createReadinessHandler(async () => {
    calls++;
    if (fail) throw new Error("private database detail");
  }, (ready) => reports.push(ready), () => time);
  const request = async () => {
    const { result, res } = response();
    await probe.handler({} as Request, res, () => {});
    return result;
  };
  const results = await Promise.all(Array.from({ length: 20 }, request));
  assert.equal(calls, 1);
  for (const result of results) {
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { status: "ok" });
    assert.equal(result.headers["Cache-Control"], "no-store");
  }
  time = 5000;
  fail = true;
  const unavailable = await request();
  assert.equal(unavailable.status, 503);
  assert.deepEqual(unavailable.body, { status: "unavailable" });
  assert.equal(unavailable.headers["Retry-After"], "5");
  await request();
  assert.equal(calls, 2);
  time = 10000;
  await request();
  assert.deepEqual(reports, [true, false]);
  time = 15000;
  fail = false;
  assert.equal((await request()).status, 200);
  assert.deepEqual(reports, [true, false, true]);
  probe.drain();
  assert.equal((await request()).status, 503);
  assert.equal(calls, 4);
  probe.drain();
  assert.deepEqual(reports, [true, false, true, false]);
});

test("readiness coalesces slow checks and refuses success during shutdown", async () => {
  let release!: () => void;
  let calls = 0;
  let time = 0;
  const reports: boolean[] = [];
  const probe = createReadinessHandler(() => {
    calls++;
    return new Promise<void>((resolve) => { release = resolve; });
  }, (ready) => reports.push(ready), () => time);
  const first = response();
  const second = response();
  const p1 = probe.handler({} as Request, first.res, () => {});
  await Promise.resolve();
  time = 60000;
  const p2 = probe.handler({} as Request, second.res, () => {});
  await Promise.resolve();
  assert.equal(calls, 1);
  probe.drain();
  release();
  await Promise.all([p1, p2]);
  assert.equal(first.result.status, 503);
  assert.equal(second.result.status, 503);
  assert.deepEqual(reports, [false]);
});
