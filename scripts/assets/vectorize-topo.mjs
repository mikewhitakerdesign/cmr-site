#!/usr/bin/env node
/**
 * Traces the approved topographic line pattern into a vector file —
 * homepage Round 2 ("Flat is a state of mind", Owner direction 2026-11-08).
 *
 *   input   scripts/assets/source/topo-pattern-figma.png (1024², the Figma image
 *           fill on 1:376, gray lines on white)
 *   output  public/home/topo.svg — one <g id="topo"> of stroked paths
 *
 * Method: threshold → Zhang–Suen thinning to a 1px centerline → follow each
 * line between endpoints/junctions (closed loops traced whole) → Ramer–Douglas–
 * Peucker simplification → Catmull–Rom smoothing to cubic Béziers. The paths
 * are the same lines as the approved artwork, now resolution-independent; the
 * stroke is drawn at a constant screen width (non-scaling) in the component.
 *
 *   node scripts/assets/vectorize-topo.mjs
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const SRC = "scripts/assets/source/topo-pattern-figma.png";
const OUT = "public/home/topo.svg";
const UP = 2; // trace at 2× for smoother centerlines

const { data, info } = await sharp(SRC)
  .flatten({ background: "#ffffff" })
  .greyscale()
  .resize({ width: 1024 * UP, kernel: "lanczos3" })
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const img = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) img[i] = data[i] < 236 ? 1 : 0;

// Zhang–Suen thinning.
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : img[y * W + x]);
let changed = true;
while (changed) {
  changed = false;
  for (const pass of [0, 1]) {
    const del = [];
    for (let y = 1; y < H - 1; y++)
      for (let x = 1; x < W - 1; x++) {
        if (!img[y * W + x]) continue;
        const p = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)];
        const b = p.reduce((s, v) => s + v, 0);
        if (b < 2 || b > 6) continue;
        let a = 0;
        for (let k = 0; k < 8; k++) if (!p[k] && p[(k + 1) % 8]) a++;
        if (a !== 1) continue;
        if (pass === 0 ? p[0] * p[2] * p[4] || p[2] * p[4] * p[6] : p[0] * p[2] * p[6] || p[0] * p[4] * p[6]) continue;
        del.push(y * W + x);
      }
    for (const i of del) img[i] = 0;
    if (del.length) changed = true;
  }
}

// Trace chains.
const N8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
// A diagonal neighbor that is also reachable through a shared orthogonal
// neighbor is not a separate branch (staircase corners would otherwise read
// as junctions and chop every line into fragments).
const nbrs = (i) => {
  const x = i % W, y = (i / W) | 0, out = [];
  for (const [dx, dy] of N8) {
    if (!at(x + dx, y + dy)) continue;
    if (dx && dy && (at(x + dx, y) || at(x, y + dy))) continue;
    out.push((y + dy) * W + x + dx);
  }
  return out;
};
const visitedEdge = new Set();
const ek = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const deg = (i) => nbrs(i).length;
const chains = [];
const walk = (start, next) => {
  const chain = [start];
  let prev = start, cur = next;
  visitedEdge.add(ek(prev, cur));
  for (;;) {
    chain.push(cur);
    if (deg(cur) !== 2) break;
    const n = nbrs(cur).find((j) => j !== prev && !visitedEdge.has(ek(cur, j)));
    if (n === undefined) break;
    visitedEdge.add(ek(cur, n));
    prev = cur;
    cur = n;
    if (cur === start) { chain.push(cur); break; }
  }
  return chain;
};
const pixels = [];
for (let i = 0; i < W * H; i++) if (img[i]) pixels.push(i);
for (const i of pixels) if (deg(i) !== 2) for (const n of nbrs(i)) if (!visitedEdge.has(ek(i, n))) chains.push(walk(i, n));
for (const i of pixels) for (const n of nbrs(i)) if (!visitedEdge.has(ek(i, n))) chains.push(walk(i, n)); // loops

function rdp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [x1, y1] = pts[a], [x2, y2] = pts[b];
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    let max = 0, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = len ? Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / len : Math.hypot(pts[i][0] - x1, pts[i][1] - y1);
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const f = (n) => Math.round(n * 10) / 10;
function toPath(pts, closed) {
  const p = closed ? pts.slice(0, -1) : pts;
  const n = p.length;
  if (n < 2) return "";
  const get = (i) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? d + "Z" : d;
}

let paths = [];
for (const c of chains) {
  if (c.length < 6) continue; // specks
  const pts = c.map((i) => [(i % W) / UP, ((i / W) | 0) / UP]);
  const closed = c[0] === c.at(-1);
  // closed loops: split at the farthest point so RDP keeps the shape
  let simp;
  if (closed) {
    let k = 1;
    for (let i = 1; i < pts.length - 1; i++)
      if (Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]) > Math.hypot(pts[k][0] - pts[0][0], pts[k][1] - pts[0][1])) k = i;
    simp = [...rdp(pts.slice(0, k + 1), 0.6).slice(0, -1), ...rdp(pts.slice(k), 0.6)];
  } else simp = rdp(pts, 0.6);
  paths.push(toPath(simp, closed));
}
paths = paths.filter(Boolean);
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">` +
  `<g id="topo" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
  paths.map((d) => `<path vector-effect="non-scaling-stroke" d="${d}"/>`).join("") +
  `</g></svg>\n`;
writeFileSync(OUT, svg);
console.log(`${chains.length} chains → ${paths.length} paths, ${(svg.length / 1024).toFixed(0)} KB`);
