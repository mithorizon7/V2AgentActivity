import fs from "fs";
import path from "path";

const locales = ["en", "lv", "ru"];
const baseLocale = "en";
const baseDir = path.resolve("client/src/locales");

function loadLocale(locale) {
  const filePath = path.join(baseDir, locale, "translation.json");
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function flatten(value, prefix = "", out = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const key = prefix ? `${prefix}.${index}` : String(index);
      flatten(item, key, out);
    });
    return out;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => {
      const next = prefix ? `${prefix}.${key}` : key;
      flatten(item, next, out);
    });
    return out;
  }
  if (prefix) {
    out.add(prefix);
  }
  return out;
}

const baseData = loadLocale(baseLocale);
const baseKeys = flatten(baseData);
let hasDiff = false;

for (const locale of locales) {
  const data = loadLocale(locale);
  const keys = flatten(data);
  const missing = [...baseKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !baseKeys.has(key));

  if (missing.length || extra.length) {
    hasDiff = true;
    console.log(`\nLocale: ${locale}`);
    if (missing.length) {
      console.log("  Missing keys:");
      missing.forEach((key) => console.log(`   - ${key}`));
    }
    if (extra.length) {
      console.log("  Extra keys:");
      extra.forEach((key) => console.log(`   - ${key}`));
    }
  }
}

if (hasDiff) {
  console.log("\nKey parity check failed. Fix missing/extra keys above.");
  process.exit(1);
}

console.log("All locale files have matching keys.");
