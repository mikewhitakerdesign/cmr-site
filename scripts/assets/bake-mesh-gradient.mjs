#!/usr/bin/env node
/**
 * Bakes the CMR Figma "Mesh gradient" shader fill into a static PNG.
 *
 * Source: the authored ShaderFill on Hero (1:377, 78:279, 78:397; 20%
 * opacity) and Just show up (1:296, 78:348, 78:466; 50% opacity) in Figma
 * file hLEeAchFtgd1WFtboIChil. Both use the same 16 control points; only
 * tessellation (128 / 256) and layer opacity differ. The shader is static
 * (manifest isAnimated: false, usesMouse: false), so a baked image is its exact
 * output without shipping a WebGPU runtime (Owner decision D2, 2026-11-07).
 *
 * This reproduces the shader's math rather than approximating it:
 *   - mesh positions: Catmull-Rom across the 4×4 control grid with clamped end
 *     points (`segment`, `catmull2`, `meshPosition` in the WGSL);
 *   - colors: the same Catmull-Rom in linear light (sRGB → linear, interpolate,
 *     clamp 0..1), then linear → sRGB as in the resolve pass.
 * The control x values are identical in every row and the y values identical
 * in every column, so position is separable (x depends only on u, y only on v)
 * and each output pixel is inverted exactly to its (u, v). The shader
 * rasterizes the same function on a 128/256-step triangle mesh; at this
 * resolution the difference is below one 8-bit step.
 *
 * Positions are normalized, so stretching the image to any aspect ratio
 * (CSS `background-size: 100% 100%`) equals rendering at that aspect.
 *
 * Usage: node scripts/assets/bake-mesh-gradient.mjs [out.png] [size]
 * Dependency-free (node:zlib); deterministic output.
 */
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const OUT = process.argv[2] ?? "public/home/mesh-gradient.png";
const SIZE = Number(process.argv[3] ?? 256);

// Figma shader params, verbatim (x, y in %, color as linear-unaware sRGB 0..1).
const P = {
  p00: { x: 0, y: 0, c: [1, 0.41999998688697815, 0.41999998688697815] },
  p10: { x: 33, y: 0, c: [1, 0.6399999856948853, 0.41999998688697815] },
  p20: { x: 67, y: 0, c: [1, 0.8199999928474426, 0.41999998688697815] },
  p30: { x: 100, y: 0, c: [1, 0.8199999928474426, 0.4000000059604645] },
  p01: { x: 0, y: 33, c: [0.699999988079071, 0.30000001192092896, 0.6000000238418579] },
  p11: { x: 33, y: 33, c: [0.800000011920929, 0.550000011920929, 0.5] },
  p21: { x: 67, y: 33, c: [0.8999999761581421, 0.699999988079071, 0.44999998807907104] },
  p31: { x: 100, y: 33, c: [0.5, 0.699999988079071, 0.3499999940395355] },
  p02: { x: 0, y: 67, c: [0.4000000059604645, 0.5, 0.699999988079071] },
  p12: { x: 33, y: 67, c: [0.3499999940395355, 0.6499999761581421, 0.6499999761581421] },
  p22: { x: 67, y: 67, c: [0.20000000298023224, 0.6499999761581421, 0.550000011920929] },
  p32: { x: 100, y: 67, c: [0.10000000149011612, 0.550000011920929, 0.699999988079071] },
  p03: { x: 0, y: 100, c: [0.019999999552965164, 0.8399999737739563, 0.6299999952316284] },
  p13: { x: 33, y: 100, c: [0.10000000149011612, 0.699999988079071, 0.6499999761581421] },
  p23: { x: 67, y: 100, c: [0.10000000149011612, 0.6000000238418579, 0.699999988079071] },
  p33: { x: 100, y: 100, c: [0.07000000029802322, 0.5400000214576721, 0.699999988079071] },
};
// pointIndex(column, row) = row * 4 + column; params are named p{column}{row}.
const point = (col, row) => P[`p${col}${row}`];

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const srgbToLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (v) => {
  const s = Math.max(v, 0);
  return s <= 0.0031308 ? s * 12.92 : 1.055 * s ** (1 / 2.4) - 0.055;
};
const catmull = (a, b, c, d, t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
};
const segment = (value) => {
  const scaled = clamp01(value) * 3;
  const index = Math.min(Math.floor(scaled), 2);
  return [index, scaled - index];
};
const neighbours = (i) => [Math.max(i - 1, 0), i, i + 1, Math.min(i + 2, 3)];

/** Catmull-Rom over the 4×4 grid of scalar f(col, row) at parameter (u, v). */
function mesh(f, u, v) {
  const [ix, tx] = segment(u);
  const [iy, ty] = segment(v);
  const xs = neighbours(ix);
  const rows = neighbours(iy).map((row) => catmull(...xs.map((col) => f(col, row)), tx));
  return catmull(...rows, ty);
}

// Position is separable: x(u) uses any row's x values, y(v) any column's y.
const xOf = (u) => mesh((col) => point(col, 0).x / 100, u, 0);
const yOf = (v) => mesh((_col, row) => point(0, row).y / 100, 0, v);

/** Inverts a monotonic 0..1 → 0..1 map by bisection. */
function invert(fn, target) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (fn(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const linearColors = [0, 1, 2].map((ch) => (col, row) => srgbToLinear(clamp01(point(col, row).c[ch])));

const us = Array.from({ length: SIZE }, (_, px) => invert(xOf, (px + 0.5) / SIZE));
const vs = Array.from({ length: SIZE }, (_, py) => invert(yOf, (py + 0.5) / SIZE));

// Raw RGB scanlines, each prefixed with PNG filter type 0 (None).
const stride = SIZE * 3 + 1;
const raw = Buffer.alloc(stride * SIZE);
for (let py = 0; py < SIZE; py++) {
  raw[py * stride] = 0;
  for (let px = 0; px < SIZE; px++) {
    for (let ch = 0; ch < 3; ch++) {
      const lin = clamp01(mesh(linearColors[ch], us[px], vs[py]));
      raw[py * stride + 1 + px * 3 + ch] = Math.round(clamp01(linearToSrgb(lin)) * 255);
    }
  }
}

// Minimal PNG encoder (8-bit truecolor, no alpha — the shader output is opaque).
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type: truecolor
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(OUT, png);
console.log(`wrote ${OUT} (${SIZE}×${SIZE}, ${png.length} bytes)`);
