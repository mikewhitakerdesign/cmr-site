"use client";

import { useEffect, useRef, useState } from "react";
import { MOTION_EVENT, motionOff } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The Science hero background: a slow, perspective view of a topographic
 * terrain whose contour lines are lifted to their own elevations, so the lines
 * stack into hills that drift toward the viewer and slowly change shape.
 *
 * Direction only from the Owner's reference video (abstract line movement,
 * composition); nothing from it is used, and its blue palette and on-screen
 * figures are left out. It belongs to the same family as ContourField (the
 * moving contours on the homepage "Flat is a state of mind" and the hill
 * heroes), and borrows its restraint:
 *
 *   - slow: the terrain drifts and evolves at a walking pace, drawn at ≤ 24 fps
 *   - continuous noise in space and time, so there is no loop and no reset
 *   - paused when off screen or when the tab is hidden
 *   - the site-wide motion preference (footer control, else the system
 *     `prefers-reduced-motion`): one still frame, never animated, and it
 *     follows the setting if it changes while the page is open
 *   - no pointer interaction; decorative: aria-hidden, behind the content
 *
 * How: a height field from 3D simplex noise (x, depth, time), shaped so peaks
 * rise out of flat ground; marching squares extracts each contour level; each
 * contour is drawn at its level's height through a simple pinhole camera.
 * Canvas 2D, no dependency, no WebGL. Lines fade with distance. The line
 * color is the element's CSS `color` (a token), so no color lives here.
 *
 * Cost is bounded: a fixed-size grid (fewer cells on small screens), a
 * device-pixel-ratio cap, and a lower frame rate if a frame takes too long.
 */
export type TerrainLinesProps = {
  className?: string;
  /** Picks a different region of the noise field. */
  seed?: number;
};

type State = "pending" | "animating" | "still";

export function TerrainLines({ className, seed = 7 }: TerrainLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<State>("pending");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const noise = makeNoise3(seed);
    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = true;
    let raf = 0;
    let last = -Infinity;
    let elapsed = 0; // seconds of motion actually shown, so pauses don't jump the terrain
    let frameMs = 1000 / 24;
    let lineRgb = "255, 255, 255";

    const readColor = () => {
      const m = getComputedStyle(canvas).color.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
      if (m) lineRgb = `${m[1]}, ${m[2]}, ${m[3]}`;
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      width = r.width;
      height = r.height;
      // Sharp hairlines, but cap the backing store (≈ 2.5 MP) so large screens stay cheap.
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2_500_000 / (width * height)));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      return true;
    };

    const draw = () => {
      if (!width) return;
      const t0 = performance.now();
      renderTerrain(ctx, { width, height, dpr, time: elapsed, noise, lineRgb });
      return performance.now() - t0;
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden || motionOff()) return;
      if (now - last >= frameMs) {
        if (Number.isFinite(last)) elapsed += Math.min(now - last, 100) / 1000;
        last = now;
        const cost = draw() ?? 0;
        // A slow device gets fewer frames rather than a busy main thread.
        if (cost > 14) frameMs = 1000 / 12;
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (motionOff()) {
        draw();
        setState("still");
        return;
      }
      setState("animating");
      if (visible && !document.hidden) {
        last = -Infinity;
        raf = requestAnimationFrame(frame);
      }
    };

    readColor();
    if (resize()) draw();
    start();

    const ro = new ResizeObserver(() => {
      if (resize()) draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", start);
    window.addEventListener(MOTION_EVENT, start);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener(MOTION_EVENT, start);
    };
  }, [seed]);

  return (
    <div aria-hidden data-slot="terrain-lines" data-state={state} className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 size-full opacity-0",
          state !== "pending" && "opacity-100 motion-safe:transition-opacity motion-safe:duration-1000",
          className,
        )}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rendering                                                          */
/* ------------------------------------------------------------------ */

type RenderInput = {
  width: number;
  height: number;
  dpr: number;
  /** Seconds of motion. */
  time: number;
  noise: Noise3;
  lineRgb: string;
};

/** Contour levels (fractions of the peak height). The flat ground gets none. */
const LEVELS = 11;
/** Alpha buckets: one stroke call per bucket keeps the draw cheap. */
const BUCKETS = 8;

/**
 * Depth runs from Z_NEAR to Z_FAR in world units; the camera sits above the
 * ground, pitched down, slightly to the left of the terrain's centre on wide
 * screens so the hills gather on the right, away from the headline.
 */
const Z_NEAR = 1.3;
const Z_FAR = 9;
const PEAK = 1.15; // world height of a full-height peak
const FREQ = 0.5; // noise cycles per world unit
const DRIFT = 0.055; // world units per second toward the viewer
const EVOLVE = 0.022; // noise time units per second

export function renderTerrain(ctx: CanvasRenderingContext2D, { width, height, dpr, time, noise, lineRgb }: RenderInput) {
  const wide = width / height;
  // Grid resolution: fewer cells on small screens.
  const nx = width < 700 ? 60 : 128;
  const nz = width < 700 ? 56 : 76;

  // Camera. Portrait screens look further down so the hills sit low, under the text.
  const pitch = wide < 1 ? 0.5 : 0.36;
  const camY = wide < 1 ? 2.3 : 1.85;
  const focal = Math.max(width, height) * (wide < 1 ? 0.95 : 0.78);
  const cx = width * (wide >= 1.3 ? 0.66 : 0.5);
  const cy = height * (wide < 1 ? 0.5 : 0.32);
  const sinP = Math.sin(pitch);
  const cosP = Math.cos(pitch);
  // Perspective-correct columns: each row spans the visible width at its depth
  // (a little beyond each edge), so every cell is about the same size on screen.
  const sx0 = -0.06 * width;
  const sxSpan = 1.12 * width;
  const xAt = (gi: number, Z: number) => ((sx0 + (gi / (nx - 1)) * sxSpan - cx) * (camY * sinP + Z * cosP)) / focal;
  // Rows are denser up close, where perspective magnifies each cell.
  const zRow = new Float32Array(nz);
  for (let j = 0; j < nz; j++) zRow[j] = Z_NEAR + (Z_FAR - Z_NEAR) * Math.pow(j / (nz - 1), 1.45);
  const zAt = (gj: number) => {
    const j = Math.min(nz - 2, Math.floor(gj));
    return zRow[j] + (zRow[j + 1] - zRow[j]) * (gj - j);
  };

  // Height field, 0…1, sampled once per frame.
  const e = new Float32Array(nx * nz);
  const tN = time * EVOLVE;
  const zShift = time * DRIFT;
  for (let j = 0; j < nz; j++) {
    const wz = (zRow[j] + zShift) * FREQ;
    for (let i = 0; i < nx; i++) {
      const wx = xAt(i, zRow[j]) * FREQ;
      const n = 0.72 * noise(wx, wz, tN) + 0.28 * noise(wx * 2.07 + 5.2, wz * 2.07 + 1.3, tN * 1.4 + 9.1);
      // Peaks out of flat ground: below the shelf it's level (no contours).
      const h = Math.max(0, (n + 0.08) / 0.95);
      e[j * nx + i] = Math.min(1, h * h * 1.15);
    }
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const paths: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
  const counts = new Uint32Array(BUCKETS);

  // Project a ground point (grid coords) at world height y; returns screen [x, y, depth].
  const project = (gi: number, gj: number, y: number): [number, number, number] => {
    const Z = zAt(gj);
    const X = xAt(gi, Z);
    const ry = y - camY;
    const zc = -ry * sinP + Z * cosP;
    const yc = ry * cosP + Z * sinP;
    return [cx + (focal * X) / zc, cy - (focal * yc) / zc, Z];
  };

  for (let k = 1; k <= LEVELS; k++) {
    const level = k / (LEVELS + 1);
    const y = level * PEAK;
    // Higher contours read a little brighter, like light catching the tops.
    const levelGain = 0.6 + 0.4 * level;
    for (let j = 0; j < nz - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = e[j * nx + i];
        const b = e[j * nx + i + 1];
        const c = e[(j + 1) * nx + i + 1];
        const d = e[(j + 1) * nx + i];
        const code = (a > level ? 1 : 0) | (b > level ? 2 : 0) | (c > level ? 4 : 0) | (d > level ? 8 : 0);
        if (code === 0 || code === 15) continue;
        // Edge crossings in grid coordinates: e0 a–b, e1 b–c, e2 d–c, e3 a–d.
        const edge = (n: number): [number, number] => {
          switch (n) {
            case 0: return [i + (level - a) / (b - a), j];
            case 1: return [i + 1, j + (level - b) / (c - b)];
            case 2: return [i + (level - d) / (c - d), j + 1];
            default: return [i, j + (level - a) / (d - a)];
          }
        };
        const centreUp = (a + b + c + d) / 4 > level;
        const segs = SEGMENTS[code] ?? (code === 5 ? (centreUp ? [0, 1, 2, 3] : [0, 3, 1, 2]) : centreUp ? [0, 3, 1, 2] : [0, 1, 2, 3]);
        for (let s = 0; s < segs.length; s += 2) {
          const [ai, aj] = edge(segs[s]);
          const [bi, bj] = edge(segs[s + 1]);
          const [sx1, sy1, z1] = project(ai, aj, y);
          const [sx2, sy2] = project(bi, bj, y);
          // Fade in from the horizon, and out right at the near edge.
          const far = 1 - smoothstep(Z_FAR * 0.45, Z_FAR, z1);
          const near = smoothstep(Z_NEAR, Z_NEAR + 1.4, z1);
          const alpha = far * near * levelGain;
          if (alpha < 0.03) continue;
          const bucket = Math.min(BUCKETS - 1, Math.floor(alpha * BUCKETS));
          paths[bucket].moveTo(sx1, sy1);
          paths[bucket].lineTo(sx2, sy2);
          counts[bucket]++;
        }
      }
    }
  }

  for (let bucket = 0; bucket < BUCKETS; bucket++) {
    if (!counts[bucket]) continue;
    // Brightest lines stay a light gray, never pure white.
    ctx.strokeStyle = `rgba(${lineRgb}, ${(((bucket + 1) / BUCKETS) * 0.62).toFixed(3)})`;
    ctx.stroke(paths[bucket]);
  }
}

/** Marching-squares segments (pairs of edge indices) for the unambiguous cases. */
const SEGMENTS: Record<number, number[]> = {
  1: [0, 3],
  2: [0, 1],
  3: [1, 3],
  4: [1, 2],
  6: [0, 2],
  7: [2, 3],
  8: [2, 3],
  9: [0, 2],
  11: [1, 2],
  12: [1, 3],
  13: [0, 1],
  14: [0, 3],
};

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/* ------------------------------------------------------------------ */
/* 3D simplex noise (Stefan Gustavson's public-domain algorithm), with */
/* a seeded permutation so the terrain is the same on every visit.     */
/* ------------------------------------------------------------------ */

export type Noise3 = (x: number, y: number, z: number) => number;

const GRAD3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

export function makeNoise3(seed: number): Noise3 {
  // mulberry32
  let s = (seed * 2654435761) >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const r = Math.floor(rand() * (i + 1));
    [p[i], p[r]] = [p[r], p[i]];
  }
  const perm = new Uint8Array(512);
  const permMod12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    permMod12[i] = perm[i] % 12;
  }
  const F3 = 1 / 3;
  const G3 = 1 / 6;

  return (xin, yin, zin) => {
    const sk = (xin + yin + zin) * F3;
    const i = Math.floor(xin + sk);
    const j = Math.floor(yin + sk);
    const k = Math.floor(zin + sk);
    const t = (i + j + k) * G3;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);
    const z0 = zin - (k - t);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 1, 0];
      else if (x0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 0, 1];
      else [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 1, 0, 1];
    } else if (y0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 0, 1, 1];
    else if (x0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 0, 1, 1];
    else [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 1, 1, 0];
    const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
    const ii = i & 255, jj = j & 255, kk = k & 255;
    const corner = (g: number, x: number, y: number, z: number) => {
      let tt = 0.6 - x * x - y * y - z * z;
      if (tt < 0) return 0;
      tt *= tt;
      const gr = GRAD3[g];
      return tt * tt * (gr[0] * x + gr[1] * y + gr[2] * z);
    };
    const n0 = corner(permMod12[ii + perm[jj + perm[kk]]], x0, y0, z0);
    const n1 = corner(permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]], x1, y1, z1);
    const n2 = corner(permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]], x2, y2, z2);
    const n3 = corner(permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]], x3, y3, z3);
    return 32 * (n0 + n1 + n2 + n3);
  };
}
