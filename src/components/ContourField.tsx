"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Ambient contour lines — the moving topographic background of the hill-page
 * heroes and the homepage "Flat is a state of mind" (Chicago Hills refinement
 * pass, Owner direction 2026-11-08). Direction only from the Owner's motion
 * references: iso-lines of a slowly changing height field that drift, merge
 * and split. Nothing from those videos is used.
 *
 * How: one WebGL2 fragment shader draws the contour lines of 3D simplex noise
 * (x, y, time), with a light domain warp for the rounded, blobby shapes. Lines
 * are anti-aliased with screen-space derivatives, so they stay a constant
 * hairline at any size. No dependency, ~3 KB.
 *
 * Restraint, by design:
 *   - slow: the field evolves at a walking pace (`speed`, noise units / s) and
 *     drifts a little; drawn at ≤ 30 fps
 *   - paused when off screen or the tab is hidden
 *   - `prefers-reduced-motion: reduce` → one still frame, never animated
 *     (and it follows the setting if it changes while the page is open)
 *   - a software WebGL renderer (SwiftShader, llvmpipe: no usable GPU) → the
 *     same still frame, so the shader never burns the CPU every frame
 *     (`data-still="software"`; reduced motion is `data-still="reduced-motion"`)
 *   - no pointer interaction (the Round 2 liquid cursor stays removed)
 *   - decorative: aria-hidden, behind the content, never moves the text
 *
 * Colors come from CSS, so they stay MWDS/CMR tokens: the line color is the
 * element's `color`, the ground its `background-color` (set them with
 * classes). Until the first frame is drawn the ground shows alone; the lines
 * then fade in. If WebGL2 isn't available, `fallback` (a static pattern)
 * renders instead.
 */
export type ContourFieldProps = {
  className?: string;
  /** Size of one noise unit in CSS px — larger means broader landforms. */
  scale?: number;
  /** Contour lines per unit of height (noise spans about −1…1). */
  levels?: number;
  /** Line width in CSS px. */
  lineWidth?: number;
  /** Noise units per second. */
  speed?: number;
  /** Picks a different region of the field, so each page gets its own terrain. */
  seed?: number;
  /** Static stand-in when WebGL2 is unavailable. */
  fallback?: ReactNode;
  /** Hold the current frame (e.g. a hover fill that isn't showing). */
  paused?: boolean;
};

type State = "pending" | "animating" | "paused" | "still" | "unsupported";
type StillReason = "reduced-motion" | "software";

/** True when WebGL is drawn on the CPU (no GPU, or a blocklisted one). */
function isSoftwareRenderer(gl: WebGL2RenderingContext): boolean {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
  return /swiftshader|llvmpipe|softpipe|software/i.test(renderer);
}

export function ContourField({
  className,
  scale = 520,
  levels = 9,
  lineWidth = 1,
  // PR #4 final pass (Owner direction): a little slower, 0.045 → 0.036.
  speed = 0.036,
  seed = 0,
  fallback,
  paused = false,
}: ContourFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const restartRef = useRef<() => void>(undefined);
  const [state, setState] = useState<State>("pending");
  const [still, setStill] = useState<StillReason | undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" });
    const program = gl && createProgram(gl);
    if (!gl || !program) {
      setState("unsupported");
      return;
    }

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u("uRes"), uTime = u("uTime"), uScale = u("uScale"), uLevels = u("uLevels");
    const uWidth = u("uWidth"), uSeed = u("uSeed"), uBg = u("uBg"), uLine = u("uLine");
    gl.useProgram(program);
    // One triangle that covers the viewport.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Browser tests run on software WebGL; they set this flag to check the animation itself.
    // Reduced motion still wins. Nothing in the site sets it.
    const forceMotion = (window as { __CMR_CONTOUR_FORCE_MOTION__?: boolean }).__CMR_CONTOUR_FORCE_MOTION__ === true;
    const software = !forceMotion && isSoftwareRenderer(gl);
    let dpr = 1;
    let visible = true;
    let raf = 0;
    let last = -Infinity;
    let elapsed = 0; // seconds of animation actually shown (pauses don't jump the field)

    const readColors = () => {
      const cs = getComputedStyle(canvas);
      gl.uniform3fv(uLine, parseRgb(cs.color));
      gl.uniform3fv(uBg, parseRgb(cs.backgroundColor));
    };

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      // Sharp hairlines, but cap the pixel count (≈ 2.5 MP) so large screens stay cheap.
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2_500_000 / (width * height)));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed * speed);
      gl.uniform1f(uScale, scale * dpr);
      gl.uniform1f(uLevels, levels);
      gl.uniform1f(uWidth, lineWidth * dpr);
      gl.uniform1f(uSeed, seed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden || reduce.matches || software || pausedRef.current) return;
      if (now - last >= 1000 / 30) {
        if (Number.isFinite(last)) elapsed += Math.min(now - last, 100) / 1000;
        last = now;
        draw();
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (reduce.matches || software) {
        draw();
        setState("still");
        setStill(reduce.matches ? "reduced-motion" : "software");
        return;
      }
      setStill(undefined);
      if (pausedRef.current) {
        setState("paused");
        return;
      }
      setState("animating");
      if (visible && !document.hidden) {
        last = -Infinity;
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    readColors();
    draw();
    start();
    restartRef.current = start;

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", start);
    reduce.addEventListener("change", start);

    return () => {
      restartRef.current = undefined;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", start);
      reduce.removeEventListener("change", start);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [scale, levels, lineWidth, speed, seed]);

  useEffect(() => {
    pausedRef.current = paused;
    restartRef.current?.();
  }, [paused]);

  return (
    <div aria-hidden data-slot="contour-field" data-state={state} data-still={still} className="pointer-events-none absolute inset-0 overflow-hidden">
      {state === "unsupported" ? (
        fallback
      ) : (
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 size-full opacity-0",
            state !== "pending" && "opacity-100 motion-safe:transition-opacity motion-safe:duration-700",
            className,
          )}
        />
      )}
    </div>
  );
}

/** "rgb(82, 82, 82)" / "rgba(…)" → [0.32, 0.32, 0.32]. Anything else reads as black. */
function parseRgb(css: string): [number, number, number] {
  const m = css.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  return m ? [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255] : [0, 0, 0];
}

const VERTEX = `#version 300 es
layout(location = 0) in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// 3D simplex noise: Ian McEwan, Ashima Arts / Stefan Gustavson (MIT licence),
// https://github.com/ashima/webgl-noise — unchanged apart from formatting.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime, uScale, uLevels, uWidth, uSeed;
uniform vec3 uBg, uLine;
out vec4 outColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Height: two octaves over a gently warped domain, slowly evolving in time and drifting.
float height(vec2 p, float t) {
  p += vec2(uSeed * 17.31, uSeed * -9.73) + vec2(t * 0.35, t * -0.12);
  vec2 w = vec2(snoise(vec3(p * 0.55, t * 0.6)), snoise(vec3(p * 0.55 + 31.7, t * 0.6)));
  vec2 q = p + 0.32 * w;
  return 0.78 * snoise(vec3(q, t)) + 0.22 * snoise(vec3(q * 2.1 + 7.3, t * 1.4));
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uScale;
  float v = height(p, uTime) * uLevels;
  // Distance to the nearest contour in device pixels; derivatives keep the width constant.
  float d = abs(fract(v + 0.5) - 0.5) / max(fwidth(v), 1e-4);
  float line = 1.0 - smoothstep(0.5 * uWidth - 0.5, 0.5 * uWidth + 0.5, d);
  outColor = vec4(mix(uBg, uLine, line), 1.0);
}`;

function createProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}
