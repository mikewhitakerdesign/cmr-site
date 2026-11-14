#!/usr/bin/env node
/**
 * The sparse contour artwork (Brand Standards, Owner final review 2026-11-14):
 * a still frame of the same field the animated contour background draws
 * (src/components/ContourField.tsx), traced to vector, for the places that
 * need it static: the PDF cover, the Graphic language contour examples and
 * the premise frame's print stand-in.
 *
 *   output  public/home/topo-sparse.svg — one <g id="contours"> of open
 *           paths, viewBox 0 0 W H, no stroke color (set where it is used);
 *           src/components/brand/sparse-contours.ts — the same paths, for the
 *           inline component (src/components/brand/SparseContours.tsx), so
 *           the lines can stay a constant hairline at any size.
 *
 * The height function is ContourField's own: 3D simplex noise (Ashima Arts /
 * Stefan Gustavson, MIT), two octaves over a lightly warped domain, at t = 0.
 * Its contours are found by marching squares on a fine grid, joined into
 * lines and thinned (Ramer–Douglas–Peucker, well under a pixel), so the lines
 * are the field's, not drawn by hand. Deterministic: same settings, same file.
 *
 *   node scripts/assets/build-sparse-contours.mjs
 */
import { writeFileSync } from "node:fs";

const OUT = "public/home/topo-sparse.svg";
const OUT_TS = "src/components/brand/sparse-contours.ts";
const W = 1600, H = 1200;
/**
 * Broad landforms and few levels: the hero backgrounds' scale (ContourField
 * scale 940), with 5 levels per unit (the heroes use 4.5). Chosen against the
 * Owner's reference: flowing bands, nested loops, wide spacing. SCALE, LEVELS
 * and SEED can be overridden from the environment to explore; the committed
 * file uses these.
 */
const SCALE = Number(process.env.SCALE ?? 940), LEVELS = Number(process.env.LEVELS ?? 5), SEED = Number(process.env.SEED ?? 3.4);
const STEP = 3; // grid spacing, px
const TOLERANCE = 0.35; // simplification, px

// ---- 3D simplex noise, ported line for line from the shader (GLSL vec ops spelled out).
const mod289 = (x) => x - Math.floor(x / 289) * 289;
const permute = (x) => mod289((x * 34 + 10) * x);
function snoise(vx, vy, vz) {
  const C0 = 1 / 6, C1 = 1 / 3;
  const s = (vx + vy + vz) * C1;
  let ix = Math.floor(vx + s), iy = Math.floor(vy + s), iz = Math.floor(vz + s);
  const t = (ix + iy + iz) * C0;
  const x0 = [vx - ix + t, vy - iy + t, vz - iz + t];
  const g = [x0[0] >= x0[1] ? 1 : 0, x0[1] >= x0[2] ? 1 : 0, x0[2] >= x0[0] ? 1 : 0]; // step(x0.yzx, x0.xyz)
  const l = g.map((v) => 1 - v);
  const i1 = [Math.min(g[0], l[2]), Math.min(g[1], l[0]), Math.min(g[2], l[1])];
  const i2 = [Math.max(g[0], l[2]), Math.max(g[1], l[0]), Math.max(g[2], l[1])];
  const x1 = [x0[0] - i1[0] + C0, x0[1] - i1[1] + C0, x0[2] - i1[2] + C0];
  const x2 = [x0[0] - i2[0] + C1, x0[1] - i2[1] + C1, x0[2] - i2[2] + C1];
  const x3 = [x0[0] - 0.5, x0[1] - 0.5, x0[2] - 0.5];
  ix = mod289(ix); iy = mod289(iy); iz = mod289(iz);
  const pz = [0, i1[2], i2[2], 1].map((o) => permute(iz + o));
  const py = pz.map((v, k) => permute(v + iy + [0, i1[1], i2[1], 1][k]));
  const p = py.map((v, k) => permute(v + ix + [0, i1[0], i2[0], 1][k]));
  // A 32-bit float, as in the shader: in 64-bit math 0.142857142857 falls just under 1/7 and floor(7 × n_) breaks.
  const n_ = Math.fround(0.142857142857);
  const ns = [n_ * 2 - 0, n_ * 0.5 - 1, n_ * 1 - 0]; // n_ * D.wyz - D.xzx
  const grads = p.map((pk) => {
    const j = pk - 49 * Math.floor(pk * ns[2] * ns[2]);
    const x_ = Math.floor(j * ns[2]);
    const y_ = Math.floor(j - 7 * x_);
    const x = x_ * ns[0] + ns[1];
    const y = y_ * ns[0] + ns[1];
    const h = 1 - Math.abs(x) - Math.abs(y);
    const sh = h <= 0 ? -1 : 0;
    const gx = x + (Math.floor(x) * 2 + 1) * sh;
    const gy = y + (Math.floor(y) * 2 + 1) * sh;
    const norm = 1.79284291400159 - 0.85373472095314 * (gx * gx + gy * gy + h * h);
    return [gx * norm, gy * norm, h * norm];
  });
  let sum = 0;
  [x0, x1, x2, x3].forEach((xk, k) => {
    let m = Math.max(0.5 - (xk[0] * xk[0] + xk[1] * xk[1] + xk[2] * xk[2]), 0);
    m = m * m;
    sum += m * m * (grads[k][0] * xk[0] + grads[k][1] * xk[1] + grads[k][2] * xk[2]);
  });
  return 105 * sum;
}
function height(px, py, t) {
  px += SEED * 17.31 + t * 0.35;
  py += SEED * -9.73 + t * -0.12;
  const wx = snoise(px * 0.55, py * 0.55, t * 0.6);
  const wy = snoise(px * 0.55 + 31.7, py * 0.55 + 31.7, t * 0.6);
  const qx = px + 0.32 * wx, qy = py + 0.32 * wy;
  return 0.78 * snoise(qx, qy, t) + 0.22 * snoise(qx * 2.1 + 7.3, qy * 2.1 + 7.3, t * 1.4);
}

// ---- Sample (one cell beyond each edge, so lines run off the frame).
const cols = Math.ceil(W / STEP) + 3, rows = Math.ceil(H / STEP) + 3;
const field = new Float64Array(cols * rows);
for (let r = 0; r < rows; r++)
  for (let c = 0; c < cols; c++) {
    const x = (c - 1) * STEP, y = (r - 1) * STEP;
    // Screen y grows downward; the shader's grows upward. Flip so the frame matches.
    field[r * cols + c] = height((x - W / 2) / SCALE, -(y - H / 2) / SCALE, 0) * LEVELS;
  }
let lo = Infinity, hi = -Infinity;
for (const v of field) { lo = Math.min(lo, v); hi = Math.max(hi, v); }

// ---- Marching squares per integer level, then join segments into lines.
const key = (x, y) => `${Math.round(x * 100)},${Math.round(y * 100)}`;
const lines = [];
for (let level = Math.ceil(lo); level <= Math.floor(hi); level++) {
  const segs = [];
  const at = (r, c) => field[r * cols + c] - level;
  const lerp = (a, b) => a / (a - b);
  for (let r = 0; r < rows - 1; r++)
    for (let c = 0; c < cols - 1; c++) {
      const a = at(r, c), b = at(r, c + 1), d = at(r + 1, c), e = at(r + 1, c + 1);
      const X = (c - 1) * STEP, Y = (r - 1) * STEP;
      const pts = [];
      if (a > 0 !== b > 0) pts.push([X + lerp(a, b) * STEP, Y]);
      if (b > 0 !== e > 0) pts.push([X + STEP, Y + lerp(b, e) * STEP]);
      if (d > 0 !== e > 0) pts.push([X + lerp(d, e) * STEP, Y + STEP]);
      if (a > 0 !== d > 0) pts.push([X, Y + lerp(a, d) * STEP]);
      if (pts.length === 2) segs.push(pts);
      else if (pts.length === 4) segs.push([pts[0], pts[1]], [pts[2], pts[3]]);
    }
  // Join by shared endpoints.
  const ends = new Map();
  segs.forEach((s, i) => { for (const p of s) { const k = key(...p); (ends.get(k) ?? ends.set(k, []).get(k)).push(i); } });
  const used = new Uint8Array(segs.length);
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const line = [...segs[i]];
    for (const dir of [1, -1]) {
      for (;;) {
        const tip = dir === 1 ? line[line.length - 1] : line[0];
        const next = (ends.get(key(...tip)) ?? []).find((j) => !used[j]);
        if (next === undefined) break;
        used[next] = 1;
        const [p, q] = segs[next];
        const other = key(...p) === key(...tip) ? q : p;
        if (dir === 1) line.push(other);
        else line.unshift(other);
      }
    }
    if (line.length > 6) lines.push(line);
  }
}

// ---- Thin each line (RDP) and write.
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  let best = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > best) { best = d; at = i; }
  }
  return best > eps ? [...rdp(pts.slice(0, at + 1), eps).slice(0, -1), ...rdp(pts.slice(at), eps)] : [a, b];
}
const f = (n) => String(Math.round(n * 10) / 10);
const ds = lines.map((l) => `M${rdp(l, TOLERANCE).map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}`);
const paths = ds.map((d) => `<path d="${d}"/>`);
writeFileSync(
  OUT_TS,
  `/**\n * The sparse contour artwork's paths, written by scripts/assets/build-sparse-contours.mjs\n * (the same paths as public/home/topo-sparse.svg). Do not edit by hand.\n */\nexport const SPARSE_CONTOURS_VIEWBOX = "0 0 ${W} ${H}";\nexport const SPARSE_CONTOURS: readonly string[] = ${JSON.stringify(ds, null, 0)};\n`,
);
writeFileSync(
  OUT,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><!-- Sparse CMR contours: a still frame of the animated contour field (scripts/assets/build-sparse-contours.mjs). --><g id="contours" fill="none">${paths.join("")}</g></svg>\n`,
);
console.log(`${OUT}: ${paths.length} lines, levels ${Math.ceil(lo)} to ${Math.floor(hi)}, ${Math.round(paths.join("").length / 1024)} KB`);
