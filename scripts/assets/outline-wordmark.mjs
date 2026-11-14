#!/usr/bin/env node
/**
 * Outlines the CMR wordmark from its typeface: the vector master of the
 * stacked wordmark (Brand Standards Review 01, 2026-11-14).
 *
 *   output  public/brand/logos/cmr-wordmark-black.svg — the three lines and the
 *           ™ as Geist Black outlines, one black path, cropped to the letters.
 *
 * The wordmark is typography, so its master is set from the type, not traced
 * from a picture of it. The specification is the live text in the Owner's
 * Figma file (src/lib/brand/spec.ts WORDMARK): Geist at weight 900, 350.14 px on
 * 313.667 px lines, tracking −1/64 em, flush left; "TM" in the same face at
 * 115.191 px, set after RUNNERS and hung from the cap height. The ™'s position
 * is the one place measured rather than specified: it is taken from the
 * Owner's artwork (scripts/assets/source/cmr-wordmark-owner.png).
 *
 * Validation (2026-11-14): line widths 1606.5, 1849.7 and 1670.3 px against
 * the trace's 1607, 1850 and 1670; rendered at the trace's size, about 1% of
 * inked pixels differ, every one of them on the anti-aliased edge (a 1 px fringe).
 * The previous master (public/brand/cmr-wordmark.svg, a potrace trace of the
 * Owner's PNG) is kept for the site footer, which draws it as a mask.
 *
 * fontkit and wawoff2 are not project dependencies (this runs once):
 *
 *   npm i --prefix /tmp/fonttools fontkit@2.0.4 wawoff2@2.0.1
 *   FONT_TOOLS_DIR=/tmp/fonttools GEIST_FONT=<Geist variable font, .ttf or .woff2> \
 *     node scripts/assets/outline-wordmark.mjs
 *
 * GEIST_FONT: the variable Geist from its publisher (Vercel, SIL OFL 1.1), or
 * the Latin WOFF2 that next/font downloads into .next/static/media.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const OUT = "public/brand/logos/cmr-wordmark-black.svg";
const tools = process.env.FONT_TOOLS_DIR;
const fontFile = process.env.GEIST_FONT;
if (!tools || !fontFile) throw new Error("Set FONT_TOOLS_DIR and GEIST_FONT (see the header comment).");
const req = createRequire(join(tools, "package.json"));
const fontkit = req("fontkit");

let bytes = readFileSync(fontFile);
if (fontFile.endsWith(".woff2")) bytes = Buffer.from(await req("wawoff2").decompress(bytes));
const base = fontkit.create(bytes);
if (base.familyName !== "Geist" || !base.variationAxes.wght) throw new Error(`${fontFile} is not the variable Geist (got ${base.familyName}).`);
const font = base.getVariation({ wght: 900 });

/** The Figma text (src/lib/brand/spec.ts WORDMARK). */
const SIZE = 350.14;
const LEADING = 313.667;
const TRACKING = -5.4709;
const TM = { size: 115.191, tracking: -1.7999 };
/** Measured from the Owner's artwork: the ™ starts 3.1 px before RUNNERS' advance ends, and its cap top sits 4.7 px below RUNNERS' cap top. */
const TM_OFFSET = { x: -3.1, capTop: 4.7 };

function setLine(text, size, tracking, x0, baseline) {
  const run = font.layout(text);
  const k = size / font.unitsPerEm;
  let x = x0;
  const paths = [];
  run.glyphs.forEach((g, i) => {
    paths.push(g.path.scale(k, -k).translate(x, baseline));
    x += run.positions[i].xAdvance * k + tracking;
  });
  return { paths, advance: x };
}

const lines = ["CHICAGO", "MOUNTAIN", "RUNNERS"].map((t, i) => setLine(t, SIZE, TRACKING, 0, i * LEADING));
const capHeight = (font.capHeight / font.unitsPerEm) * SIZE;
const tmCap = (font.capHeight / font.unitsPerEm) * TM.size;
const tmBaseline = 2 * LEADING - capHeight + TM_OFFSET.capTop + tmCap;
const tm = setLine("TM", TM.size, TM.tracking, lines[2].advance + TM_OFFSET.x, tmBaseline);

const all = [...lines.flatMap((l) => l.paths), ...tm.paths];
const bb = all.map((p) => p.bbox).filter((b) => Number.isFinite(b.minX));
const [minX, minY, maxX, maxY] = [Math.min(...bb.map((b) => b.minX)), Math.min(...bb.map((b) => b.minY)), Math.max(...bb.map((b) => b.maxX)), Math.max(...bb.map((b) => b.maxY))];
const [w, h] = [Math.ceil((maxX - minX) * 10) / 10, Math.ceil((maxY - minY) * 10) / 10];

// Two decimals is 1/100 of a pixel at the master's size: far below anything visible.
const round = (s) => s.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 100) / 100));
const d = round(all.map((p) => p.translate(-minX, -minY).toSVG()).join(""));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  `<!-- Chicago Mountain Runners wordmark. Vector master, black. Geist Black outlines (scripts/assets/outline-wordmark.mjs). -->\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><path fill="#000" d="${d}"/></svg>\n`,
);
console.log(`${OUT}: ${w} × ${h}, ${d.length} path characters; line widths ${lines.map((l) => (Math.max(...l.paths.map((p) => p.bbox.maxX)) - Math.min(...l.paths.map((p) => p.bbox.minX))).toFixed(1)).join(", ")}`);
