#!/usr/bin/env node
/**
 * Traces the approved CMR badge raster into a PROPOSED vector master — Brand
 * Standards (Owner authorization, 2026-11-13: "a faithful vector reconstruction
 * of the existing badge as a proposed master. Preserve the original artwork. Do
 * not replace the production asset until the reconstructed version is reviewed
 * and approved.").
 *
 *   input   public/brand/cmr-logo-mask-shape.svg — the unmodified Figma export
 *           ("Brand / CMR logo" 39:152). It embeds a 1386 × 728 grayscale image
 *           in which white is the visible badge (the lozenge, with "CMR™"
 *           knocked out).
 *   output  public/brand/proposed/cmr-badge-proposed.svg — one filled path,
 *           same 1386 × 728 frame, so it overlays the raster exactly.
 *
 * Nothing is redrawn, smoothed by hand or corrected: the path is the raster's
 * own edge, found by potrace. The production badge (src/components/CmrLogo.tsx)
 * is untouched and still uses the raster. The Brand Standards show this file
 * only as a proposed master, labelled as such.
 *
 * potrace is not a project dependency (it runs once), as for the wordmark
 * (scripts/assets/trace-wordmark.mjs):
 *
 *   npm i --prefix /tmp/tracer potrace@2.1.8
 *   POTRACE_DIR=/tmp/tracer node scripts/assets/trace-badge.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import sharp from "sharp";

const SRC = "public/brand/cmr-logo-mask-shape.svg";
const OUT = "public/brand/proposed/cmr-badge-proposed.svg";
const dir = process.env.POTRACE_DIR;
if (!dir) throw new Error("Set POTRACE_DIR (see the header comment).");
const potrace = createRequire(join(dir, "package.json"))("potrace");

const b64 = readFileSync(SRC, "utf8").match(/xlink:href="data:image\/png;base64,([^"]+)"/)?.[1];
if (!b64) throw new Error(`${SRC} has no embedded image.`);
const mask = Buffer.from(b64, "base64");
const { width, height } = await sharp(mask).metadata();

// potrace traces dark shapes, so invert: the visible (white) badge becomes the traced shape.
// Traced at 4× (Lanczos) so the curve fit follows the anti-aliased edge, not the pixel grid.
const SCALE = 4;
const png = await sharp(mask).greyscale().negate().resize(width * SCALE, height * SCALE, { kernel: "lanczos3" }).png().toBuffer();

const svg = await new Promise((resolve, reject) =>
  potrace.trace(png, { threshold: 128, turdSize: 16, optTolerance: 0.2, color: "#000", background: "transparent" }, (err, out) =>
    err ? reject(err) : resolve(out),
  ),
);
const d = svg.match(/<path d="([^"]+)"/)[1];
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  `<!-- PROPOSED vector master of the CMR badge. Traced from the approved raster (scripts/assets/trace-badge.mjs). Not approved; not used in production. -->\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><path transform="scale(${1 / SCALE})" fill-rule="evenodd" d="${d}"/></svg>\n`,
);
console.log(`${OUT}: ${width}×${height}, ${d.length} path characters`);
