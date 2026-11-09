#!/usr/bin/env node
/**
 * Traces the Owner's CMR wordmark into a vector mask — Chicago Hills refinement
 * pass (PR #4, Owner direction 2026-11-08: "a large wordmark block" in the
 * footer, the attached image as the reference).
 *
 *   input   scripts/assets/source/cmr-wordmark-owner.png (1916×941, the image
 *           the Owner attached: "CHICAGO / MOUNTAIN / RUNNERS™", black)
 *   output  public/brand/cmr-wordmark.svg — one black filled path on a
 *           transparent ground, trimmed to the letters
 *
 * The footer draws it as a CSS mask over the current text color (CmrWordmark),
 * so the shapes and proportions are the Owner's, not a font substitute.
 *
 * potrace is not a project dependency (it runs once). Install it anywhere and
 * point POTRACE_DIR at that node_modules folder's parent:
 *
 *   npm i --prefix /tmp/tracer potrace@2.1.8
 *   POTRACE_DIR=/tmp/tracer node scripts/assets/trace-wordmark.mjs
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import sharp from "sharp";

const SRC = "scripts/assets/source/cmr-wordmark-owner.png";
const OUT = "public/brand/cmr-wordmark.svg";
const dir = process.env.POTRACE_DIR;
if (!dir) throw new Error("Set POTRACE_DIR (see the header comment).");
const potrace = createRequire(join(dir, "package.json"))("potrace");

// Flatten onto white and trim to the letters (2px margin kept for anti-aliasing).
const png = await sharp(SRC).flatten({ background: "#ffffff" }).greyscale().trim({ threshold: 10 }).png().toBuffer();
const { width, height } = await sharp(png).metadata();

const svg = await new Promise((resolve, reject) =>
  potrace.trace(png, { threshold: 128, turdSize: 4, optTolerance: 0.2, color: "#000", background: "transparent" }, (err, out) =>
    err ? reject(err) : resolve(out),
  ),
);
const path = svg.match(/<path[^>]*\/>/)[0];
writeFileSync(
  OUT,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${path}</svg>\n`,
);
console.log(`${OUT}: ${width}×${height}`);
