#!/usr/bin/env node
/**
 * Renders the CMR hill-profile illustration family — homepage Round 2,
 * refined in Round 2.1 (wider, simpler, lower relief, one recipe for all five).
 *
 * Style reference: the approved Mt. Trashmore artwork (Figma 31:16): a
 * grayscale terrain "block" seen from above at an angle, fine contour lines
 * with every fifth line heavier, an irregular island edge, and a layered slab
 * underneath. This script redraws that idea as vector art for every hill so
 * the five share one style and stay sharp at any size.
 *
 *   input   scripts/assets/source/terrain/<slug>.json  (fetch-terrain.mjs)
 *   output  public/hills/<slug>-profile.svg
 *           src/lib/hill-profiles.generated.ts         (anchors + figures)
 *
 * What is measured and what is interpretation:
 *   - SHAPE: from the elevation grid (USGS 3DEP via AWS Terrain Tiles),
 *     lightly smoothed. Warren Hill is the exception: no distinct hill could be
 *     located in the data, so its shape is an interpretive placeholder and it
 *     carries no figures (`interpretive: true`).
 *   - FIGURES: summit = highest grid point; base = median ground elevation on
 *     a ring around the hill's foot; rise = summit − base. Rounded to 5 ft and
 *     shown with "≈". Prominence is NOT computed (it needs a key-col search
 *     well beyond the sampled window) and is never shown.
 *   - INTERPRETATION: the island outline and slab; the viewpoint (the same for
 *     every hill: from the south, tilted); smoothing at 10% of the hill's width (much heavier than the figures
 *     use) and a fuller, dome-like height curve (relief^0.8) so the hills read as
 *     hills, not cones; 12 equal contour bands (no contour interval is claimed);
 *     and the vertical exaggeration — drawn rise = 55 + 75·√(rise/60) px, a
 *     gentle compression that keeps the family coherent without turning small
 *     hills into peaks. The factor is recorded per hill and the caption says
 *     "Vertical scale exaggerated."
 *
 *   node scripts/assets/terrain/render-profiles.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SLUGS = ["cricket-hill", "warren-hill", "horner-hill", "schiller-hill", "mt-trashmore"];
const VB = { w: 1000, h: 540 };
const CX = 500, CY = 300; // screen position of the summit's ground point
const ISLAND_HALF_W = 455; // island half-width on screen (px)
const TILT = 0.3; // ground depth foreshortening (lower = flatter, wider view)
const SLAB_PX = 22;
const BANDS = 12; // equal contour bands, every fourth line heavier
const drawnRise = (riseFt) => 55 + 75 * Math.sqrt(Math.max(riseFt, 8) / 60); // px

/* ------------------------------------------------------------------ utils */
const seeded = (str) => {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 2 ** 32;
};
const r1 = (n) => Math.round(n * 10) / 10;

function gaussianBlur(grid, n, sigma) {
  const rad = Math.ceil(sigma * 3);
  const k = Array.from({ length: 2 * rad + 1 }, (_, i) => Math.exp(-((i - rad) ** 2) / (2 * sigma * sigma)));
  const pass = (src, horiz) => {
    const out = new Float64Array(n * n);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        let s = 0, w = 0;
        for (let i = -rad; i <= rad; i++) {
          const xx = horiz ? x + i : x, yy = horiz ? y : y + i;
          if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
          s += src[yy * n + xx] * k[i + rad];
          w += k[i + rad];
        }
        out[y * n + x] = s / w;
      }
    return out;
  };
  return pass(pass(grid, true), false);
}

/** Marching squares → closed rings (grid coords) of {f >= 0}. f must be negative on the border. */
function contourRings(f, n) {
  const segs = [];
  const interp = (a, b) => a / (a - b);
  for (let y = 0; y < n - 1; y++)
    for (let x = 0; x < n - 1; x++) {
      const v = [f[y * n + x], f[y * n + x + 1], f[(y + 1) * n + x + 1], f[(y + 1) * n + x]];
      const code = (v[0] >= 0 ? 8 : 0) | (v[1] >= 0 ? 4 : 0) | (v[2] >= 0 ? 2 : 0) | (v[3] >= 0 ? 1 : 0);
      if (code === 0 || code === 15) continue;
      const e = [
        [x + interp(v[0], v[1]), y], // top
        [x + 1, y + interp(v[1], v[2])], // right
        [x + interp(v[3], v[2]), y + 1], // bottom
        [x, y + interp(v[0], v[3])], // left
      ];
      const table = {
        1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[1, 0]], 5: [[3, 0], [1, 2]], 6: [[2, 0]], 7: [[3, 0]],
        8: [[0, 3]], 9: [[0, 2]], 10: [[0, 1], [2, 3]], 11: [[0, 1]], 12: [[1, 3]], 13: [[1, 2]], 14: [[2, 3]],
      };
      for (const [a, b] of table[code]) segs.push([e[a], e[b]]);
    }
  const key = (p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`;
  const ends = new Map(); // endpoint → segment indices (each interior point is shared by exactly two)
  segs.forEach((s, i) => {
    for (const p of s) {
      const k = key(p);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(i);
    }
  });
  const used = new Uint8Array(segs.length);
  const rings = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const ring = [segs[i][0], segs[i][1]];
    for (;;) {
      const tail = ring.at(-1);
      const next = (ends.get(key(tail)) ?? []).find((j) => !used[j]);
      if (next === undefined) break;
      used[next] = 1;
      const [a, b] = segs[next];
      ring.push(key(a) === key(tail) ? b : a);
    }
    if (ring.length > 4) rings.push(ring);
  }
  return rings;
}

function simplify(pts, tol) {
  if (pts.length < 4) return pts;
  const [fx, fy] = pts[0], [lx, ly] = pts.at(-1);
  if (Math.hypot(fx - lx, fy - ly) < 1e-6) {
    // Closed ring: split at the point farthest from the start, simplify each half.
    let k = 1;
    for (let i = 1; i < pts.length - 1; i++) if (Math.hypot(pts[i][0] - fx, pts[i][1] - fy) > Math.hypot(pts[k][0] - fx, pts[k][1] - fy)) k = i;
    return [...simplify(pts.slice(0, k + 1), tol).slice(0, -1), ...simplify(pts.slice(k), tol)];
  }
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0, idx = -1;
    const [x1, y1] = pts[a], [x2, y2] = pts[b];
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / len;
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

/** Smooth closed path through points (Catmull-Rom → cubic Béziers). */
function smoothClosed(pts) {
  const p = pts[0][0] === pts.at(-1)[0] && pts[0][1] === pts.at(-1)[1] ? pts.slice(0, -1) : pts;
  const n = p.length;
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + "Z";
}
const polyline = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${r1(p[0])} ${r1(p[1])}`).join("");

/* ------------------------------------------------------- interpretive data */
/** Warren Hill: no distinct hill found in the elevation data. A generic, clearly interpretive dome. */
function interpretiveGrid(size) {
  const g = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      const x = (c / (size - 1) - 0.5) * 2, y = (0.5 - r / (size - 1)) * 2;
      const d = (x / 0.5) ** 2 + (y / 0.4) ** 2;
      row.push(600 + 25 * Math.exp(-d * 1.4));
    }
    g.push(row);
  }
  return g;
}

/* ------------------------------------------------------------------ main */
mkdirSync("public/hills", { recursive: true });
const profiles = {};

for (const slug of SLUGS) {
  const src = JSON.parse(readFileSync(`scripts/assets/source/terrain/${slug}.json`, "utf8"));
  const interpretive = slug === "warren-hill";
  const rand = seeded(slug);

  // Field on a fine grid (bilinear upsample of a heavily smoothed source: the
  // drawing is deliberately simpler than the data).
  const N0 = src.grid.size;
  const raw = Float64Array.from((interpretive ? interpretiveGrid(N0) : src.elevations).flat());
  const cellM = src.grid.cellMeters;
  let smooth = raw; // replaced below, once the hill's size is known (smoothing scales with it)
  const at = (gx, gy) => {
    const x = Math.max(0, Math.min(N0 - 1.001, gx)), y = Math.max(0, Math.min(N0 - 1.001, gy));
    const x0 = Math.floor(x), y0 = Math.floor(y), tx = x - x0, ty = y - y0;
    const v = (X, Y) => smooth[Y * N0 + X];
    return (v(x0, y0) * (1 - tx) + v(x0 + 1, y0) * tx) * (1 - ty) + (v(x0, y0 + 1) * (1 - tx) + v(x0 + 1, y0 + 1) * tx) * ty;
  };
  const centre = (N0 - 1) / 2;
  // ground metres (east, north) relative to the window centre ↔ source grid coords
  const toGrid = (e, nn) => [centre + e / cellM, centre - nn / cellM];
  const zAt = (e, nn) => at(...toGrid(e, nn));

  // Figures come from a lightly smoothed copy (removes tile seams, keeps peaks).
  const fine = gaussianBlur(raw, N0, 0.7);
  const atFine = (gx, gy) => fine[Math.round(Math.max(0, Math.min(N0 - 1, gy))) * N0 + Math.round(Math.max(0, Math.min(N0 - 1, gx)))];

  // Summit: highest point near the middle of the window (the window is centred on it).
  let top = { e: 0, n: 0, z: -Infinity };
  for (let n = -24; n <= 24; n += 1)
    for (let e = -24; e <= 24; e += 1) {
      const z = atFine(...toGrid(e, n));
      if (z > top.z) top = { e, n, z };
    }
  const half = src.windowMeters / 2;

  // Radial profile: median ground elevation at each distance from the summit.
  const ringAt = (r) => {
    const v = [];
    for (let a = 0; a < 360; a += 4) {
      const e = top.e + r * Math.cos((a * Math.PI) / 180), n = top.n + r * Math.sin((a * Math.PI) / 180);
      if (Math.abs(e) < half && Math.abs(n) < half) v.push(atFine(...toGrid(e, n)));
    }
    v.sort((x, y) => x - y);
    return v[Math.floor(v.length / 2)];
  };
  const profile = [];
  for (let r = 0; r < half * 0.98; r += 3) profile.push([r, ringAt(r)]);
  // Foot: where the median slope first flattens below 1.5% (≈ 0.05 ft per m),
  // measured over 15 m; base: median ground just outside the foot.
  let foot = profile.at(-1)[0];
  for (let i = 5; i < profile.length - 5; i++) {
    const slope = (profile[i][1] - profile[i + 5][1]) / (profile[i + 5][0] - profile[i][0]) / 3.28084;
    if (profile[i][1] < top.z - 3 && slope < 0.015) { foot = profile[i][0]; break; }
  }
  const outside = profile.filter(([r]) => r >= foot && r <= foot + 30).map(([, z]) => z).sort((x, y) => x - y);
  const base = outside[Math.floor(outside.length / 2)];
  const rise = top.z - base;
  // Metres shown across the island: the hill fills most of it (wider, more hill-like).
  const frame = Math.min(src.windowMeters * 0.98, Math.max(110, foot * 2.1));
  const R0 = frame * 0.46;
  // Smoothing for the drawing: 10% of the hill's width, so every hill keeps the
  // same amount of detail relative to its size (terraces and ditches vanish).
  smooth = gaussianBlur(raw, N0, Math.max(2, (frame * 0.1) / cellM));

  // Peak of the smoothed field (the drawing's own summit), for normalising heights.
  let peak = { e: top.e, n: top.n, z: -Infinity };
  for (let n = -30; n <= 30; n += 1.5)
    for (let e = -30; e <= 30; e += 1.5) {
      const z = zAt(top.e + e, top.n + n);
      if (z > peak.z) peak = { e: top.e + e, n: top.n + n, z };
    }

  // Viewpoint: from the south, tilted, identical for every hill.
  const s = ISLAND_HALF_W / R0; // px per metre across
  const px = drawnRise(rise); // drawn height of the whole rise
  const project = (e, n, h) => [CX + (e - top.e) * s, CY - (n - top.n) * s * TILT - h * px];
  const exaggeration = px / (Math.max(rise, 8) * 0.3048 * s); // drawn vs. true height at this horizontal scale

  // Island outline: a gentle blob around the summit (interpretive).
  const ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
  const blobR = (t) => R0 * (1 + 0.04 * Math.sin(2 * t + ph[0]) + 0.03 * Math.sin(3 * t + ph[1]) + 0.015 * Math.sin(5 * t + ph[2]));

  // Normalised height 0–1 (0 = base, 1 = the drawing's peak): never below the
  // base (rivers, roads and ditches would tear the edge), a fuller dome curve
  // (^0.8), eased to 0 over the outer 24% of the island so every contour closes
  // inside it and the edge sits flat on the slab.
  const heightAt = (e, n) => {
    const t = Math.atan2(n - top.n, e - top.e);
    const q = Math.hypot(e - top.e, n - top.n) / blobR(t);
    const u = q <= 0.76 ? 0 : q >= 1 ? 1 : (q - 0.76) / 0.24;
    const k = 1 - u * u * (3 - 2 * u);
    const h = Math.min(1, Math.max(0, (zAt(e, n) - base) / (peak.z - base)));
    return Math.pow(h, 0.8) * k;
  };

  // Masked field on a fine local grid (metres around the summit).
  const M = 181;
  const local = (i) => (i / (M - 1) - 0.5) * 2 * R0 * 1.12;
  const field = new Float64Array(M * M);
  for (let y = 0; y < M; y++)
    for (let x = 0; x < M; x++) {
      const e = top.e + local(x), n = top.n - local(y);
      const t = Math.atan2(n - top.n, e - top.e);
      const inside = Math.hypot(e - top.e, n - top.n) <= blobR(t);
      field[y * M + x] = inside ? heightAt(e, n) : -1;
    }
  const outline = [];
  for (let i = 0; i < 360; i++) {
    const t = (i * Math.PI) / 180;
    outline.push({ e: top.e + blobR(t) * Math.cos(t), n: top.n + blobR(t) * Math.sin(t), h: 0 });
  }
  const topPts = outline.map((p) => project(p.e, p.n, p.h));
  const botPts = topPts.map(([x, y]) => [x, y + SLAB_PX]);

  // Front-facing part of the edge: outward normal points toward the viewer.
  const front = outline.map((_, i) => {
    const a = topPts[(i + 359) % 360], b = topPts[(i + 1) % 360];
    return b[0] - a[0] > 0; // edge drawn left→right along the bottom = faces the viewer
  });

  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB.w} ${VB.h}" fill="none" stroke-linejoin="round" stroke-linecap="round">`);
  out.push(`<title>${src.name} — ${interpretive ? "interpretive terrain illustration" : "terrain illustration from USGS 3DEP elevation data"}</title>`);
  // Slab
  let slab = "";
  for (let i = 0; i < 360; i++) {
    const j = (i + 1) % 360;
    if (!front[i] && !front[j]) continue;
    const q = [topPts[i], topPts[j], botPts[j], botPts[i]];
    slab += `M${q.map((p) => `${r1(p[0])} ${r1(p[1])}`).join("L")}Z`;
  }
  out.push(`<path d="${slab}" fill="#d9d9d9" stroke="#d9d9d9" stroke-width="0.6"/>`);
  // Strata lines and slab outline, front only, in runs
  const runs = [];
  let cur = [];
  for (let k = 0; k < 361; k++) {
    const i = k % 360;
    if (front[i]) cur.push(i);
    else if (cur.length) { runs.push(cur); cur = []; }
  }
  if (cur.length) runs.push(cur);
  for (const run of runs) {
    for (const t of [0.34, 0.67])
      out.push(`<path d="${polyline(simplify(run.map((i) => [topPts[i][0], topPts[i][1] + (botPts[i][1] - topPts[i][1]) * t]), 0.4))}" stroke="#9a9a9a" stroke-width="0.7" vector-effect="non-scaling-stroke"/>`);
    out.push(`<path d="${polyline(simplify(run.map((i) => botPts[i]), 0.4))}" stroke="#1a1a1a" stroke-width="1.3" vector-effect="non-scaling-stroke"/>`);
    for (const i of [run[0], run.at(-1)])
      out.push(`<path d="M${r1(topPts[i][0])} ${r1(topPts[i][1])}L${r1(botPts[i][0])} ${r1(botPts[i][1])}" stroke="#1a1a1a" stroke-width="1.2" vector-effect="non-scaling-stroke"/>`);
  }
  // Top surface
  out.push(`<path d="${smoothClosed(simplify(topPts, 0.5))}" fill="#e4e4e4" stroke="#1a1a1a" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`);
  // Contour bands, low → high (painter's order); every fourth line heavier.
  for (let k = 1; k < BANDS; k++) {
    const L = k / BANDS;
    const f = field.map((v) => v - L);
    const shade = Math.round(226 + 28 * (k / BANDS)); // darker low, lighter high: a dome in grayscale
    const fill = `#${shade.toString(16).repeat(3)}`;
    const major = k % 4 === 0;
    for (const ring of contourRings(f, M)) {
      const pts = ring.map(([gx, gy]) => project(top.e + local(gx), top.n - local(gy), L));
      const simp = simplify(pts, 0.6);
      if (simp.length < 4) continue;
      out.push(
        `<path d="${smoothClosed(simp)}" fill="${fill}" stroke="${major ? "#1a1a1a" : "#808080"}" stroke-width="${major ? 1.15 : 0.55}" vector-effect="non-scaling-stroke"/>`,
      );
    }
  }
  const S = project(peak.e, peak.n, 1);
  out.push(`<circle cx="${r1(S[0])}" cy="${r1(S[1])}" r="5" fill="#1a1a1a"/>`);
  out.push(`</svg>`);
  writeFileSync(`public/hills/${slug}-profile.svg`, out.join("\n"));

  // Anchors for the HTML annotations (fractions of the viewBox).
  const frontMost = topPts.reduce((b, p) => (p[1] > b[1] ? p : b));
  const frac = ([x, y]) => [+(x / VB.w).toFixed(4), +(y / VB.h).toFixed(4)];
  const round5 = (v) => Math.round(v / 5) * 5;
  profiles[slug] = {
    src: `/hills/${slug}-profile.svg`,
    width: VB.w,
    height: VB.h,
    interpretive,
    anchors: { summit: frac(S), base: frac(frontMost) },
    figures: interpretive ? null : { summitFt: round5(top.z), baseFt: round5(base), riseFt: round5(rise) },
    measured: interpretive ? null : { summitFt: r1(top.z), baseFt: r1(base), riseFt: r1(rise) },
    drawing: { frameMeters: Math.round(frame), contourBands: BANDS, verticalExaggeration: r1(exaggeration) },
    location: src.summit,
    source: interpretive
      ? "Interpretive: no distinct hill could be located in the elevation data near Warren Park. Shape is illustrative only."
      : `Shape and figures from ${src.source.elevation}, sampled ${src.source.fetched}. Location: ${src.source.location}.`,
  };
  console.log(
    `${slug.padEnd(14)} ${interpretive ? "interpretive" : `summit ${top.z.toFixed(1)} base ${base.toFixed(1)} rise ${rise.toFixed(1)} ft`}` +
      `  frame ${Math.round(frame)} m, ${BANDS - 1} contours, drawn ${px.toFixed(0)}px = ×${exaggeration.toFixed(1)}, ` +
      `${(Buffer.byteLength(out.join("\n")) / 1024).toFixed(0)} KB`,
  );
}

writeFileSync(
  "src/lib/hill-profiles.generated.ts",
  `// Generated by scripts/assets/terrain/render-profiles.mjs — do not edit by hand.\n` +
    `// See that script for what is measured and what is interpretation.\n` +
    `import type { HillProfileData } from "@/lib/hill-profile";\n\n` +
    `export const hillProfiles: Record<string, HillProfileData> = ${JSON.stringify(profiles, null, 2)};\n`,
);
