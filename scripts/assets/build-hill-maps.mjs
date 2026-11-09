#!/usr/bin/env node
/**
 * Builds the static location maps for "Find what you've been looking for." on
 * each hill page — Chicago Hills refinement pass (PR #4, Owner direction
 * 2026-11-08: "an actual map or a static map screenshot/image of the location,
 * rather than a generic placeholder").
 *
 *   output  public/hills/maps/{slug}.jpg — 1280×720, greyscale, centred on
 *           the place (the pin is drawn by the page, at the centre)
 *
 * Source: OpenStreetMap standard tiles (tile.openstreetmap.org), fetched once
 * here — about 24 tiles per hill, sequentially, with an identifying
 * User-Agent, as the OSMF tile usage policy asks. Pages load only these JPEGs;
 * nothing calls a map service at runtime. Attribution ("© OpenStreetMap
 * contributors", linked to /copyright) is shown on every map, as the licence
 * requires.
 *
 * Centres: OpenStreetMap Nominatim, 2026-11-08 — the same places the
 * "Get directions" links search for (the park or landmark, never a meeting
 * point). Schiller Woods is the preserve's centre: the hill's exact spot is
 * unconfirmed, so the map shows the woods, zoomed out one step.
 *
 *   node scripts/assets/build-hill-maps.mjs
 */
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const PLACES = [
  // slug, lat, lon, zoom — Nominatim result (class/type)
  ["cricket-hill", 41.9643352, -87.642767, 16], // natural/hill "Cricket Hill"
  ["warren-hill", 42.0028753, -87.6859883, 16], // leisure/park "Warren Park"
  ["horner-hill", 41.9576131, -87.6964303, 16], // leisure/park "Horner Park"
  ["schiller-hill", 41.9473764, -87.8459328, 15], // natural/wood "Schiller Woods"
  ["mt-trashmore", 42.0244838, -87.7028706, 16], // leisure/park "Robert E. James Park"
];
const W = 1280, H = 720, TILE = 256;
const UA = "cmr-site-asset-build/1.0 (one-off static map build; github.com/mikewhitakerdesign/cmr-site)";
const OUT = "public/hills/maps";
mkdirSync(OUT, { recursive: true });

const project = (lat, lon, z) => {
  const n = 2 ** z * TILE;
  const s = Math.sin((lat * Math.PI) / 180);
  return [((lon + 180) / 360) * n, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n];
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const [slug, lat, lon, z] of PLACES) {
  const [cx, cy] = project(lat, lon, z);
  const left = Math.round(cx - W / 2), top = Math.round(cy - H / 2);
  const tiles = [];
  for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + H - 1) / TILE); ty++) {
    for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + W - 1) / TILE); tx++) {
      const res = await fetch(`https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`${slug}: tile ${z}/${tx}/${ty} → ${res.status}`);
      tiles.push({ input: Buffer.from(await res.arrayBuffer()), left: tx * TILE - left, top: ty * TILE - top });
      await sleep(250);
    }
  }
  // Composite on an oversized canvas (tiles overhang the edges), then crop.
  const pad = TILE;
  const canvas = await sharp({ create: { width: W + 2 * pad, height: H + 2 * pad, channels: 3, background: "#ffffff" } })
    .composite(tiles.map((t) => ({ ...t, left: t.left + pad, top: t.top + pad })))
    .png()
    .toBuffer();
  await sharp(canvas)
    .extract({ left: pad, top: pad, width: W, height: H })
    .greyscale()
    .linear(1.08, -10) // a touch more contrast: the site is black and white, not OSM's pastels
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(`${OUT}/${slug}.jpg`);
  console.log(`${OUT}/${slug}.jpg  (${tiles.length} tiles, z${z})`);
}
