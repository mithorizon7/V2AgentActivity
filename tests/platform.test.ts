import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, copyFile, writeFile, rm, readdir, access, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PostgresStorage } from "../server/postgresStorage";

const overrides = ["NODE_OPTIONS", "NODE_PATH", "NODE_EXTRA_CA_CERTS", "NODE_USE_SYSTEM_CA", "NODE_TLS_REJECT_UNAUTHORIZED", "SSL_CERT_FILE", "SSL_CERT_DIR", "OPENSSL_CONF", "OPENSSL_CONF_INCLUDE", "OPENSSL_MODULES", "OPENSSL_ENGINES"];

test("deployment starts the packaged runtime without a host Node launcher", async () => {
  const deployment = (await readFile(".replit", "utf8")).split("[deployment]")[1]?.split(/\n\[/)[0];
  assert(deployment);
  assert.match(deployment, /^run = \["sh", "scripts\/start-production.sh"\]$/m);
});

test("production build/start clear inherited runtime overrides", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "learning-runtime-env-"));
  try {
    await mkdir(join(root, "scripts"));
    await mkdir(join(root, "dist/node-runtime"), { recursive: true });
    const probe = `#!/bin/sh\nset -eu\nfor name in ${overrides.join(" ")}; do\n if env | cut -d= -f1 | grep -qx "$name"; then exit 21; fi\ndone\n`;
    await writeFile(join(root, "scripts/with-runtime.sh"), probe + '[ "$PINNED_NODE_RUNTIME" = 1 ]\necho clean-build\n', { mode: 0o700 });
    await writeFile(join(root, "dist/node-runtime/node"), probe + 'if [ "$1" = dist/index.js ]; then [ "$NODE_ENV" = production ]; echo clean-start; fi\n', { mode: 0o700 });
    for (const script of ["build-production.sh", "start-production.sh"]) {
      await copyFile(`scripts/${script}`, join(root, "scripts", script));
      await t.test(script, () => {
        const env = { ...process.env, ...Object.fromEntries(overrides.map(name => [name, "synthetic-override"])) };
        const result = spawnSync("sh", [join(root, "scripts", script)], { env, encoding: "utf8", timeout: 15_000 });
        assert.equal(result.status, 0, result.stderr);
        assert.match(result.stdout, /clean-(build|start)/);
      });
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("pinned production bootstrap never selects an already compliant host binary", async () => {
  const root = await mkdtemp(join(tmpdir(), "learning-runtime-pin-"));
  try {
    await mkdir(join(root, "scripts"));
    await mkdir(join(root, "bin"));
    await copyFile("scripts/with-runtime.sh", join(root, "scripts/with-runtime.sh"));
    const marker = join(root, "host-node-used");
    await writeFile(join(root, "bin/node"), '#!/bin/sh\ntouch "$HOST_NODE_MARKER"\nexit 0\n', { mode: 0o700 });
    await writeFile(join(root, "bin/uname"), '#!/bin/sh\ncase "$1" in -s) echo Linux;; -m) echo x86_64;; esac\n', { mode: 0o700 });
    await writeFile(join(root, "bin/curl"), '#!/bin/sh\nexit 92\n', { mode: 0o700 });
    const result = spawnSync("sh", [join(root, "scripts/with-runtime.sh"), "sh", "-c", "exit 0"], {
      env: { PATH: `${join(root, "bin")}:${process.env.PATH}`, PINNED_NODE_RUNTIME: "1", HOST_NODE_MARKER: marker },
      encoding: "utf8", timeout: 15_000,
    });
    assert.equal(result.status, 92);
    await assert.rejects(access(marker));
    assert.deepEqual(await readdir(join(root, ".runtime")), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

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
