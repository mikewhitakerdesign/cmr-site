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
 *   - slow: the terrain drifts and evolves at a walking pace, drawn at ≤ 20 fps
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
    let frameMs = 1000 / 20;
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
        if (cost > 18) frameMs = 1000 / 12;
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

/**
 * The terrain (refinement pass, Owner direction 2026-11-09, closer to the
 * reference's layered line formations): scattered peaks whose contour rings
 * stack into tall, tapering spires, on low rolling ground whose contours
 * meander between them, seen from above at about 33° so the field fills the
 * frame to the top edge with no horizon.
 *
 * Peaks live on an unbounded jittered lattice in world space (a hash decides
 * whether each cell has one, where, how wide and how tall), so as the field
 * drifts toward the viewer new peaks arrive from the distance forever: there
 * is no loop and no reset. Each peak's height breathes slowly on its own phase;
 * the ground undulates with simplex noise; a light domain warp keeps the rings
 * irregular rather than circular.
 */
const LEVELS = 22; // contour levels, evenly spaced in height
const LEVEL_STEP = 0.05; // in units of the peak height
const BUCKETS = 10; // alpha buckets: one stroke call each
const PEAK = 2.2; // world height of a full-height peak
const CELL = 2.6; // lattice cell size; at most one peak per cell
const DENSITY = 0.42; // share of cells with a peak
const R_MIN = 0.6;
const R_MAX = 1.5;
const SHARPNESS = 1.5; // exp(−sharpness · d²/r²): tapering spires
const GROUND = 0.15; // rolling ground, in peak heights
const GROUND_FREQ = 0.3;
const WARP = 0.3;
const DRIFT = 0.15; // world units per second toward the viewer (a far peak takes about three minutes to arrive)
const EVOLVE = 0.02; // ground noise time units per second
const BREATHE = 0.05; // radians per second of each peak's slow rise and fall

/** A uniform 0…1 hash of an integer cell and a salt. */
function hash(x: number, z: number, salt: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(z | 0, 668265263) ^ Math.imul(salt, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function renderTerrain(ctx: CanvasRenderingContext2D, { width, height, dpr, time, noise, lineRgb }: RenderInput) {
  const portrait = width / height < 1;
  // Grid: columns uniform on screen, rows denser up close. Fewer cells on small screens.
  const nx = width < 700 ? 64 : 116;
  const nz = width < 700 ? 64 : 84;
  // Camera: above the field, pitched down; on wide screens the view centre sits right, away from the headline.
  const pitch = portrait ? 0.72 : 0.58;
  const camY = portrait ? 6.5 : 6;
  const zNear = portrait ? 1.6 : 3;
  const zFar = 32;
  const focal = Math.max(width, height) * 0.75;
  const cx = width * (width / height >= 1.3 ? 0.6 : 0.5);
  const cy = height * 0.5;
  const sinP = Math.sin(pitch);
  const cosP = Math.cos(pitch);

  const zRow = new Float32Array(nz);
  for (let j = 0; j < nz; j++) zRow[j] = zNear + (zFar - zNear) * Math.pow(j / (nz - 1), 1.6);
  const zAt = (gj: number) => {
    const j = Math.min(nz - 2, Math.floor(gj));
    return zRow[j] + (zRow[j + 1] - zRow[j]) * (gj - j);
  };
  // Perspective-correct columns: each row spans the visible width at its depth, a little past each edge.
  const sx0 = -0.08 * width;
  const sxSpan = 1.16 * width;
  const xAt = (gi: number, Z: number) => ((sx0 + (gi / (nx - 1)) * sxSpan - cx) * (camY * sinP + Z * cosP)) / focal;

  const tN = time * EVOLVE;
  const zShift = time * DRIFT;
  const heightAt = (wx: number, wz: number) => {
    const qx = wx + WARP * noise(wx * 0.35, wz * 0.35, tN);
    const qz = wz + WARP * noise(wx * 0.35 + 17, wz * 0.35 + 5, tN);
    let h = GROUND * (0.5 + 0.5 * noise(qx * GROUND_FREQ, qz * GROUND_FREQ, tN * 0.7));
    const gx = Math.floor(qx / CELL);
    const gz = Math.floor(qz / CELL);
    for (let a = -1; a <= 1; a++) {
      for (let b = -1; b <= 1; b++) {
        const X = gx + a;
        const Z = gz + b;
        if (hash(X, Z, 1) > DENSITY) continue;
        const px = (X + 0.15 + 0.7 * hash(X, Z, 2)) * CELL;
        const pz = (Z + 0.15 + 0.7 * hash(X, Z, 3)) * CELL;
        const r = R_MIN + (R_MAX - R_MIN) * hash(X, Z, 4);
        const d2 = ((qx - px) ** 2 + (qz - pz) ** 2) / (r * r);
        if (d2 > 4) continue;
        const amp = (0.4 + 0.6 * hash(X, Z, 5)) * (0.82 + 0.18 * Math.sin(time * BREATHE + 6.283 * hash(X, Z, 6)));
        h += amp * Math.exp(-d2 * SHARPNESS);
      }
    }
    return h;
  };

  const e = new Float32Array(nx * nz);
  for (let j = 0; j < nz; j++) {
    const Z = zRow[j];
    for (let i = 0; i < nx; i++) e[j * nx + i] = heightAt(xAt(i, Z), Z + zShift);
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const paths: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
  const counts = new Uint32Array(BUCKETS);

  // A grid point (fractional grid coords) at world height y → screen [x, y, depth].
  const project = (gi: number, gj: number, y: number): [number, number, number] => {
    const Z = zAt(gj);
    const X = xAt(gi, Z);
    const ry = y - camY;
    const zc = -ry * sinP + Z * cosP;
    const yc = ry * cosP + Z * sinP;
    return [cx + (focal * X) / zc, cy - (focal * yc) / zc, Z];
  };

  for (let k = 1; k <= LEVELS; k++) {
    const level = k * LEVEL_STEP;
    const y = level * PEAK;
    // Higher rings read a little brighter, like light catching the tops.
    const levelGain = 0.5 + 0.5 * Math.min(1, level / 0.9);
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
          // Soft at both ends of the depth range, like a shallow depth of field.
          const far = 1 - smoothstep(zFar * 0.45, zFar, z1);
          const near = smoothstep(zNear, zNear + 1.6, z1);
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
