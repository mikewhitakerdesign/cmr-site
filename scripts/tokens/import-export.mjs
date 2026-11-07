#!/usr/bin/env node
// Writes the output of scripts/tokens/figma-export.js into tokens/mwds/.
//
// Usage: node scripts/tokens/import-export.mjs <export-page.json> [...more pages]
//
// Each page is the verbatim JSON returned by the exporter. Every file is
// verified against the FNV-1a checksum Figma computed before it is written,
// so a transcription or truncation error fails loudly instead of silently
// changing a token. Pages are merged; the manifest's checksums accumulate.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MANIFEST = "tokens/mwds/manifest.json";

export const fnv1a = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
};

const pages = process.argv.slice(2);
if (!pages.length) {
  console.error("usage: import-export.mjs <export-page.json> [...]");
  process.exit(1);
}

let manifest = null;
const checksums = {};
const exportDays = new Set();
for (const page of pages) {
  const { manifest: m, files } = JSON.parse(readFileSync(page, "utf8"));
  for (const [path, tree] of Object.entries(files)) {
    const expected = m.checksums[path];
    const actual = fnv1a(JSON.stringify(tree));
    if (expected !== actual) {
      throw new Error(`${path}: checksum ${actual} does not match Figma export ${expected}`);
    }
    if (!path.startsWith("tokens/mwds/") || path.includes("..")) throw new Error(`Refusing path ${path}`);
    mkdirSync(dirname(resolve(root, path)), { recursive: true });
    writeFileSync(resolve(root, path), JSON.stringify(tree, null, 2) + "\n");
    checksums[path] = actual;
    console.log(`✓ ${path} (${actual})`);
  }
  // A page may carry only { checksums, exportedAt } to stay under the
  // use_figma response cap; exactly one page must carry the full manifest.
  const exportedAt = m.source?.exportedAt ?? m.exportedAt;
  exportDays.add(exportedAt.slice(0, 10));
  if (m.collections) {
    if (manifest) throw new Error("More than one page carries a full manifest.");
    manifest = m;
  }
}
if (!manifest) throw new Error("No page carried the full manifest (source/collections/themes).");
if (exportDays.size > 1) {
  console.warn("! Pages were exported on different days; re-export all pages together if Figma changed.");
}

manifest.checksums = Object.fromEntries(Object.entries(checksums).sort(([a], [b]) => a.localeCompare(b)));
for (const c of manifest.collections) {
  for (const mode of c.exportedModes) {
    if (!manifest.checksums[mode.file] && !existsSync(resolve(root, mode.file))) {
      throw new Error(`Manifest lists ${mode.file} but it was not exported. Include every page.`);
    }
  }
}
writeFileSync(resolve(root, MANIFEST), JSON.stringify(manifest, null, 2) + "\n");
console.log(`✓ ${MANIFEST}`);
