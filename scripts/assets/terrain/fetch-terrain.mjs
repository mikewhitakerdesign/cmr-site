#!/usr/bin/env node
/**
 * Samples elevation around each CMR hill — homepage Round 2 hill profiles.
 *
 * Source: AWS Open Data "Terrain Tiles" (Terrarium encoding, zoom 15,
 * ~3.5 m/px at Chicago's latitude). In the United States these tiles are
 * built from USGS 3DEP (formerly NED) elevation models; see
 * https://registry.opendata.aws/terrain-tiles/ and
 * https://github.com/tilezen/joerd/blob/master/docs/data-sources.md.
 * (The USGS 3DEP ImageServer itself returned 504s on 2026-11-08.)
 *
 * Hill locations: OpenStreetMap (Nominatim) — named features where they exist
 * (Cricket Hill node 1474219292, Mount Trashmore peak), otherwise the park,
 * with the hill found as the highest point of greatest local relief inside a
 * search radius. Each choice is printed so it can be checked.
 *
 * Output: scripts/assets/source/terrain/<slug>.json — a north-up grid of
 * ground elevations in feet around the summit, plus provenance. These files
 * are committed so the illustrations can be re-rendered offline
 * (render-profiles.mjs). Re-run this only to refresh the source data:
 *
 *   node scripts/assets/terrain/fetch-terrain.mjs
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const Z = 15;
const CACHE = join(tmpdir(), "cmr-terrain-tiles");
const OUT = "scripts/assets/source/terrain";
const FT = 3.28084;

/** search: where to look; window: side of the sampled square (m); grid: samples per side. */
export const HILLS = [
  { slug: "cricket-hill", name: "Cricket Hill", search: [41.9643352, -87.642767], radius: 120, window: 380, osm: "node 1474219292 (natural=hill)" },
  { slug: "warren-hill", name: "Warren Hill", search: [42.0028753, -87.6859883], radius: 330, window: 300, osm: "Warren Park (leisure=park)" },
  { slug: "horner-hill", name: "Horner Hill", search: [41.9576131, -87.6964303], radius: 330, window: 380, osm: "Horner Park (leisure=park)" },
  { slug: "schiller-hill", name: "Schiller Hill", search: [41.9568917, -87.8390706], radius: 900, window: 300, osm: "Schiller Woods (natural=wood)" },
  { slug: "mt-trashmore", name: "Mt. Trashmore", search: [42.023416, -87.7055544], radius: 120, window: 680, osm: "Mount Trashmore (natural=peak)" },
];
const GRID = 121;

const tileXY = (lat, lon) => {
  const n = 2 ** Z;
  const x = ((lon + 180) / 360) * n;
  const r = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
  return [x, y];
};

const tiles = new Map();
async function tile(tx, ty) {
  const key = `${tx}/${ty}`;
  if (tiles.has(key)) return tiles.get(key);
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, `${Z}-${tx}-${ty}.png`);
  if (!existsSync(file)) {
    const res = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${tx}/${ty}.png`);
    if (!res.ok) throw new Error(`tile ${key}: HTTP ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const { data } = await sharp(readFileSync(file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const meters = new Float32Array(256 * 256);
  for (let i = 0; i < meters.length; i++) meters[i] = data[i * 3] * 256 + data[i * 3 + 1] + data[i * 3 + 2] / 256 - 32768;
  tiles.set(key, meters);
  return meters;
}

/** Bilinear elevation in feet. */
async function elevationFt(lat, lon) {
  const [fx, fy] = tileXY(lat, lon);
  const px = fx * 256 - 0.5, py = fy * 256 - 0.5;
  const x0 = Math.floor(px), y0 = Math.floor(py);
  const v = async (X, Y) => (await tile(Math.floor(X / 256), Math.floor(Y / 256)))[(Y % 256) * 256 + (X % 256)];
  const a = await v(x0, y0), b = await v(x0 + 1, y0), c = await v(x0, y0 + 1), d = await v(x0 + 1, y0 + 1);
  const tx = px - x0, ty = py - y0;
  return ((a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty) * FT;
}

const mPerDegLat = 111_320;
const offset = ([lat, lon], dxEast, dyNorth) => [
  lat + dyNorth / mPerDegLat,
  lon + dxEast / (mPerDegLat * Math.cos((lat * Math.PI) / 180)),
];

mkdirSync(OUT, { recursive: true });
for (const hill of HILLS) {
  // 1. Summit: the local maximum with the greatest relief over its surroundings.
  const step = 6;
  const pts = [];
  for (let dy = -hill.radius; dy <= hill.radius; dy += step)
    for (let dx = -hill.radius; dx <= hill.radius; dx += step) {
      if (dx * dx + dy * dy > hill.radius ** 2) continue;
      pts.push({ dx, dy, z: await elevationFt(...offset(hill.search, dx, dy)) });
    }
  const near = (p, r) => pts.filter((q) => (q.dx - p.dx) ** 2 + (q.dy - p.dy) ** 2 <= r * r);
  let best = null;
  for (const p of pts) {
    const n = near(p, 24);
    if (n.some((q) => q.z > p.z)) continue; // not a local maximum
    const ring = near(p, 130).filter((q) => (q.dx - p.dx) ** 2 + (q.dy - p.dy) ** 2 >= 100 ** 2);
    if (ring.length < 8) continue;
    const sorted = ring.map((q) => q.z).sort((a, b) => a - b);
    const relief = p.z - sorted[Math.floor(sorted.length / 2)];
    if (!best || relief > best.relief) best = { ...p, relief };
  }
  const summit = offset(hill.search, best.dx, best.dy);

  // 2. North-up grid around the summit.
  const half = hill.window / 2;
  const cell = hill.window / (GRID - 1);
  const grid = [];
  for (let r = 0; r < GRID; r++) {
    const row = [];
    for (let c = 0; c < GRID; c++) row.push(Math.round((await elevationFt(...offset(summit, -half + c * cell, half - r * cell))) * 10) / 10);
    grid.push(row);
  }
  const record = {
    slug: hill.slug,
    name: hill.name,
    summit: { lat: +summit[0].toFixed(6), lon: +summit[1].toFixed(6) },
    windowMeters: hill.window,
    grid: { size: GRID, cellMeters: +cell.toFixed(4), units: "ft", rows: "north to south", cols: "west to east" },
    source: {
      elevation:
        "AWS Open Data Terrain Tiles (Terrarium, z15, ~3.5 m/px), built from USGS 3DEP in the United States",
      location: `OpenStreetMap / Nominatim: ${hill.osm}; summit = local maximum of greatest relief within ${hill.radius} m`,
      fetched: new Date().toISOString().slice(0, 10),
    },
    elevations: grid,
  };
  writeFileSync(join(OUT, `${hill.slug}.json`), JSON.stringify(record));
  console.log(
    `${hill.slug.padEnd(14)} summit ${summit.map((v) => v.toFixed(5)).join(",")} ` +
      `(${best.dx},${best.dy} m from search point)  ${best.z.toFixed(1)} ft, relief ${best.relief.toFixed(1)} ft`,
  );
}
