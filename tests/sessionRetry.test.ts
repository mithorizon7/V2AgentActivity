import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, rm, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { build } from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

test("reviewed session hook retries creation or progress without clearing saved work", async (t) => {
  const output = resolve(`.security-evidence/session-retry-${process.pid}.mjs`);
  const state: any = {};
  (globalThis as any).__sessionRetryHarness = state;
  await mkdir(resolve(".security-evidence"), { recursive: true });
  await build({
    entryPoints: ["client/src/hooks/useSession.ts"],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    plugins: [{
      name: "session-service-fixtures",
      setup(builder) {
        const mocks: Record<string, string> = {
          "@tanstack/react-query": `
            export const useQuery = () => globalThis.__sessionRetryHarness.query;
            export const useMutation = () => globalThis.__sessionRetryHarness.mutation;
            export const useQueryClient = () => ({});
          `,
          "@/hooks/useConsent": `
            export const useConsent = () => ({ hasConsent: true });
            export const safeLocalStorage = () => globalThis.__sessionRetryHarness.storage;
          `,
          "@/lib/queryClient": `
            export const apiRequest = () => { throw new Error("Unexpected network request"); };
          `,
        };
        builder.onResolve({ filter: /^(@tanstack\/react-query|@\/hooks\/useConsent|@\/lib\/queryClient)$/ },
          ({ path }) => ({ path, namespace: "fixture" }));
        builder.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({ contents: mocks[path] }));
      },
    }],
  });
  try {
    const { useSession } = await import(pathToFileURL(output).href);
    const render = (savedSession: string | null, error: Error | null, creationError: Error | null) => {
      const calls = { create: 0, refetch: 0, remove: 0, save: 0 };
      state.storage = {
        getItem: () => savedSession,
        removeItem: () => { calls.remove++; },
        setItem: () => { calls.save++; },
      };
      state.query = { error, isLoading: false, refetch: () => { calls.refetch++; } };
      state.mutation = { error: creationError, isPending: false, mutate: () => { calls.create++; } };
      let session: ReturnType<typeof useSession>;
      function Probe() {
        session = useSession();
        return null;
      }
      renderToString(React.createElement(Probe));
      return { session: session!, calls };
    };
    await t.test("failed creation offers a retry of session creation", () => {
      const { session, calls } = render(null, null, new Error("503: unavailable"));
      assert.equal(session.hasSessionError, true);
      session.retrySession();
      assert.deepEqual(calls, { create: 1, refetch: 0, remove: 0, save: 0 });
    });
    await t.test("existing-session failure retries progress and preserves saved work", () => {
      const { session, calls } = render("session-existing-123", new Error("503: unavailable"), null);
      assert.equal(session.hasSessionError, true);
      session.retrySession();
      assert.equal(session.sessionId, "session-existing-123");
      assert.deepEqual(calls, { create: 0, refetch: 1, remove: 0, save: 0 });
    });
    await t.test("404 expiry remains on the existing automatic recovery path", () => {
      const { session } = render("session-existing-123", new Error("404: Progress not found"), null);
      assert.equal(session.hasSessionError, false);
      assert.equal(session.isLoading, true);
    });
    await t.test("healthy sessions do not show a connection error", () => {
      assert.equal(render("session-existing-123", null, null).session.hasSessionError, false);
    });
    await t.test("all three locales provide privacy and retry wording", async () => {
      for (const language of ["en", "ru", "lv"]) {
        const locale = JSON.parse(await readFile(`client/src/locales/${language}/translation.json`, "utf8"));
        assert(locale.consent.sessionUnavailable.length > 20);
        assert(locale.consent.retrySession.length > 0);
        assert.match(locale.consent.description, /24/);
      }
    });
  } finally {
    delete (globalThis as any).__sessionRetryHarness;
    await rm(output, { force: true });
  }
});
