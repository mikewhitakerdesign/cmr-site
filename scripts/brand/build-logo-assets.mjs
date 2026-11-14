#!/usr/bin/env node
/**
 * Builds every downloadable logo file and the site's favicons from the two
 * vector masters (Brand Standards, Marks › Files):
 *
 *   masters (inputs, black)          public/brand/logos/cmr-badge-black.svg      (scripts/assets/trace-badge.mjs)
 *                                    public/brand/logos/cmr-wordmark-black.svg   (scripts/assets/outline-wordmark.mjs)
 *   white versions                   public/brand/logos/cmr-*-white.svg          the same path, filled white
 *   transparent PNGs                 public/brand/logos/cmr-*-{black,white}.png  PNG_WIDTH px wide
 *   the whole set                    public/brand/logos/cmr-logos.zip            the eight files and a short README
 *   favicons (badge outline only)    src/app/icon.svg, src/app/favicon.ico (16, 32, 48), src/app/apple-icon.png (180)
 *
 *   npm run brand:logos            # write everything
 *   npm run brand:logos -- --check # write nothing; fail if any file is out of date
 *
 * Deterministic: the same masters always give byte-identical files (the ZIP has
 * fixed timestamps), so --check can compare bytes. tests/lib/brand.test.ts
 * checks the outputs' contents.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { crc32, deflateRawSync } from "node:zlib";
import sharp from "sharp";

const DIR = "public/brand/logos";
const PNG_WIDTH = 3000;
const CHECK = process.argv.includes("--check");

const MARKS = {
  badge: { title: "Chicago Mountain Runners badge" },
  wordmark: { title: "Chicago Mountain Runners wordmark" },
};

const read = (p) => readFileSync(p, "utf8");
const out = new Map(); // path → Buffer

const masterOf = (mark) => {
  const svg = read(`${DIR}/cmr-${mark}-black.svg`);
  if (/<image/i.test(svg)) throw new Error(`${mark}: the master embeds a raster image.`);
  if (!/fill="#000"/.test(svg)) throw new Error(`${mark}: the master's path must be filled #000.`);
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) ?? [];
  if (!w) throw new Error(`${mark}: no viewBox at the origin.`);
  return { svg, w: Number(w), h: Number(h) };
};

const whiteOf = (svg, mark) =>
  svg
    .replace(/<!--[^>]*-->/, `<!-- ${MARKS[mark].title}. White, for black and dark grounds. Made from cmr-${mark}-black.svg (scripts/brand/build-logo-assets.mjs). -->`)
    .replace('fill="#000"', 'fill="#fff"');

const pngOf = async (svg, w) => {
  // Render at exactly PNG_WIDTH: set the SVG's own size, so the vector is drawn at that size (not scaled up from a small raster).
  const h = Math.round((PNG_WIDTH * 1000 * w.h) / w.w) / 1000;
  const sized = svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${PNG_WIDTH}" height="${h}"`);
  return sharp(Buffer.from(sized), { density: 72 }).png({ compressionLevel: 9 }).toBuffer();
};

for (const mark of Object.keys(MARKS)) {
  const m = masterOf(mark);
  const white = whiteOf(m.svg, mark);
  out.set(`${DIR}/cmr-${mark}-white.svg`, Buffer.from(white));
  out.set(`${DIR}/cmr-${mark}-black.png`, await pngOf(m.svg, m));
  out.set(`${DIR}/cmr-${mark}-white.png`, await pngOf(white, m));
}

/* ---------------------------------------------------------------- ZIP */

const README = `Chicago Mountain Runners logo files
====================================

Badge (primary identity)       cmr-badge-black.svg / .png, cmr-badge-white.svg / .png
Wordmark (the full name)       cmr-wordmark-black.svg / .png, cmr-wordmark-white.svg / .png

SVG is the master: use it for anything printed, cut, stitched or enlarged.
PNG (${PNG_WIDTH} px wide, transparent) is for documents and screens.
Black for white and light grounds; white for black and dark grounds.
The letters in the badge are cut out: whatever is behind the badge shows through them.

Use the files as supplied: no stretching, recoloring, outlines, effects or retyping.
Keep the TM. Give the badge clear space equal to the height of its letters.
Screen: the badge is never shown narrower than 96 px.
Print, embroidery and other materials: agree the smallest size with the vendor and proof it.

The complete standards: https://chicagomountainrunners.com/brand/marks
`;

/** A ZIP with fixed timestamps (1 January 2026), so the same inputs make the same bytes. */
function zip(entries) {
  const DOS_TIME = 0;
  const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const deflated = deflateRawSync(data, { level: 9 });
    const useDeflate = deflated.length < data.length;
    const body = useDeflate ? deflated : data;
    const crc = crc32(data) >>> 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(useDeflate ? 8 : 0, 8);
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(useDeflate ? 8 : 0, 10);
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBuf, body);
    centrals.push(central, nameBuf);
    offset += local.length + nameBuf.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

const FILES = ["badge", "wordmark"].flatMap((m) => ["black", "white"].flatMap((ink) => [`cmr-${m}-${ink}.svg`, `cmr-${m}-${ink}.png`]));
const fileBytes = (name) => out.get(`${DIR}/${name}`) ?? readFileSync(`${DIR}/${name}`);
out.set(`${DIR}/cmr-logos.zip`, zip([...FILES.map((f) => [`cmr-logos/${f}`, fileBytes(f)]), ["cmr-logos/README.txt", Buffer.from(README)]]));

/* ----------------------------------------------------------- favicons */

/**
 * The favicon is the badge's outline alone: no letters, no ™ (Owner decision,
 * Review 01). The outline is the master's first subpath (the outer contour);
 * the letters are the rest. Black shape on a white square.
 */
const badge = masterOf("badge");
const pathTag = badge.svg.match(/<path [^>]+>/)[0];
const transform = pathTag.match(/transform="([^"]+)"/)[1];
const outer = pathTag.match(/ d="(M [^M]+)/)[1].trim();
if (!/Z\s*$/i.test(outer) && !/[\d.]\s*$/.test(outer)) throw new Error("Unexpected outline subpath.");

/** The icon on a square: the outline centered, `inset` of the side clear on the left and right. */
const icon = (inset) => {
  const side = badge.w / (1 - 2 * inset);
  const ty = (side - badge.h) / 2;
  const tx = (side - badge.w) / 2;
  const r = (n) => Math.round(n * 100) / 100;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(side)} ${r(side)}">` +
    `<rect width="${r(side)}" height="${r(side)}" fill="#fff"/>` +
    `<g transform="translate(${r(tx)} ${r(ty)})"><path transform="${transform}" fill="#000" d="${outer}"/></g></svg>\n`
  );
};

// Browser tabs: as large as the square allows. Home screens crop and round the corners: more room.
const tabIcon = icon(0.04);
out.set("src/app/icon.svg", Buffer.from(tabIcon));
const png = (svg, size) => sharp(Buffer.from(svg.replace("<svg ", `<svg width="${size}" height="${size}" `))).png({ compressionLevel: 9 }).toBuffer();
out.set("src/app/apple-icon.png", await png(icon(0.14), 180));

/** An ICO holding PNG images (supported by every current browser). */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(([size, data], i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, e);
    head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(data.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map(([, d]) => d)]);
}
out.set("src/app/favicon.ico", ico(await Promise.all([16, 32, 48].map(async (s) => [s, await png(tabIcon, s)]))));

/* -------------------------------------------------------------- write */

let stale = 0;
for (const [path, data] of out) {
  const same = existsSync(path) && readFileSync(path).equals(data);
  if (CHECK) {
    if (!same) {
      stale++;
      console.error(`out of date: ${path}`);
    }
  } else if (!same) {
    writeFileSync(path, data);
    console.log(`wrote ${path} (${data.length.toLocaleString("en-US")} bytes)`);
  }
}
if (CHECK && stale) {
  console.error(`${stale} file(s) out of date. Run npm run brand:logos.`);
  process.exit(1);
}
console.log(CHECK ? "Logo files and favicons are current." : "Done.");
