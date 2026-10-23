import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, rm, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("worked-example navigation stacks and permits translated labels to wrap", async () => {
  const output = resolve(`.security-evidence/onboarding-layout-${process.pid}.mjs`);
  await mkdir(resolve(".security-evidence"), { recursive: true });
  await build({
    entryPoints: ["client/src/components/WorkedExample.tsx"],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "esm",
    jsx: "automatic",
    packages: "external",
    plugins: [{
      name: "locale-fixture",
      setup(builder) {
        builder.onResolve({ filter: /^react-i18next$/ }, () => ({ path: "translation", namespace: "fixture" }));
        builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
          contents: `export const useTranslation = () => ({ t: key => key.split('.').reduce((value, part) => value?.[part], globalThis.__onboardingLocale) ?? key });`,
        }));
      },
    }],
  });
  try {
    const { WorkedExample } = await import(pathToFileURL(output).href);
    for (const language of ["en", "ru", "lv"]) {
      const locale = JSON.parse(await readFile(`client/src/locales/${language}/translation.json`, "utf8"));
      (globalThis as any).__onboardingLocale = locale;
      const markup = renderToStaticMarkup(React.createElement(WorkedExample, { onComplete() {}, onBack() {} }));
      for (const id of ["button-previous-example", "button-next-example"]) {
        const button = markup.match(new RegExp(`<button[^>]*data-testid="${id}"[^>]*>`))?.[0];
        assert(button, `${language}: missing ${id}`);
        assert.match(button, /whitespace-normal/);
        assert.match(button, /h-auto/);
      }
      assert.match(markup, /flex flex-col gap-3 sm:flex-row sm:flex-wrap/);
      assert(markup.includes(locale.workedExample.next));
    }
  } finally {
    delete (globalThis as any).__onboardingLocale;
    await rm(output, { force: true });
  }
});
