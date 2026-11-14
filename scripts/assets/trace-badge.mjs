#!/usr/bin/env node
/**
 * Traces the approved CMR badge raster into the badge's vector master.
 *
 *   input   public/brand/cmr-logo-mask-shape.svg — the unmodified Figma export
 *           ("Brand / CMR logo"). It embeds a 1386 × 728 grayscale image in
 *           which white is the visible badge (the outline, with "CMR™"
 *           knocked out). No original vector of the badge exists; this raster
 *           is the approved source.
 *   output  public/brand/logos/cmr-badge-black.svg — one filled path, cropped
 *           to the artwork (no margin), black, letters transparent.
 *
 * History: traced 2026-11-13 as a *proposed* master; validated and promoted to
 * the production master in Brand Standards Review 01 (2026-11-14). Validation:
 * seven subpaths (outline, C, M, R, the R's counter, and the ™'s T and M), no
 * embedded raster, 0.18% of the raster's inked pixels differ at 1× (all on the
 * anti-aliased edge). The trace inherits the raster's edge texture: invisible
 * at any normal size, it shows only under close inspection at very large sizes.
 *
 * Nothing is redrawn, smoothed by hand or corrected: the path is the raster's
 * own edge, found by potrace. The site header (src/components/CmrLogo.tsx)
 * still draws the badge from the raster and its masks.
 *
 * The other logo files (white, PNG, ZIP, favicons) are derived from this one by
 * scripts/brand/build-logo-assets.mjs.
 *
 * potrace is not a project dependency (it runs once):
 *
 *   npm i --prefix /tmp/tracer potrace@2.1.8
 *   POTRACE_DIR=/tmp/tracer node scripts/assets/trace-badge.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import sharp from "sharp";

const SRC = "public/brand/cmr-logo-mask-shape.svg";
const OUT = "public/brand/logos/cmr-badge-black.svg";
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

// Crop to the artwork: render the path at 8× and find its ink, to 1/8 px, rounded outward to 0.1 px.
const R = 8;
const frame = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * R}" height="${h * R}">${body}</svg>`;
const ink = await sharp(Buffer.from(frame(width, height, `<path transform="scale(${1 / SCALE})" fill-rule="evenodd" d="${d}"/>`)))
  .extractChannel("alpha")
  .raw()
  .toBuffer({ resolveWithObject: true });
let [x0, y0, x1, y1] = [Infinity, Infinity, -1, -1];
for (let y = 0; y < ink.info.height; y++)
  for (let x = 0; x < ink.info.width; x++)
    if (ink.data[y * ink.info.width + x] > 0) [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x + 1), Math.max(y1, y + 1)];
const fl = (v) => Math.floor((v / R) * 10) / 10;
const ce = (v) => Math.ceil((v / R) * 10) / 10;
const [bx, by] = [fl(x0), fl(y0)];
const [bw, bh] = [+(ce(x1) - bx).toFixed(1), +(ce(y1) - by).toFixed(1)];

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  `<!-- Chicago Mountain Runners badge. Vector master, black. Traced from the approved artwork (scripts/assets/trace-badge.mjs); letters knocked out. -->\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bw} ${bh}" width="${bw}" height="${bh}"><path transform="translate(${-bx} ${-by}) scale(${1 / SCALE})" fill="#000" fill-rule="evenodd" d="${d}"/></svg>\n`,
);
console.log(`${OUT}: ${bw} × ${bh} (crop of the ${width} × ${height} frame at ${bx}, ${by}), ${d.length} path characters`);
