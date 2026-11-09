"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { GRADE_RANGE, inclineGeometry } from "@/lib/science";
import { motionOff } from "@/lib/motion";
import { cn } from "@/lib/utils";

const one = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** The introductory animation: 0% → the illustrative 10%, once, when the figure is first well in view. */
export const INTRO = { from: 0, to: GRADE_RANGE.initial, durationMs: 1800, visibleRatio: 0.5 } as const;
/** Label size in drawing units: larger where the drawing is shown small (phones). */
const T = "text-[25px] sm:text-[17px]";
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Physics figure: grade, angle, rise and horizontal distance on a uniform
 * slope, drawn to scale (no vertical exaggeration). The slider changes only
 * the geometry; it is labelled as geometry, not a physiological calculator.
 *
 * Introduction (refinement pass, Owner direction 2026-11-09): the slope starts
 * flat and, the first time the figure is at least half in view, rises to 10%
 * over 1.8s (ease in-out), with every number following the same value. It runs
 * once per page view. Touching the slider at any point cancels it and the
 * visitor's value stands. With reduced motion (the site preference, which
 * follows the system setting) it shows 10% without a transition. Without
 * IntersectionObserver it simply starts at 10%.
 *
 * Layout: every label keeps clear of the slope, the baseline and the others
 * from 0% to 45%, and stays inside the drawing.
 */
export function InclineDiagram() {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const doneRef = useRef(false);
  const [grade, setGrade] = useState<number>(INTRO.from);
  const [animating, setAnimating] = useState(false);

  const cancel = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    doneRef.current = true;
    setAnimating(false);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const play = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      if (motionOff()) {
        setGrade(INTRO.to);
        return;
      }
      const start = performance.now();
      setAnimating(true);
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / INTRO.durationMs);
        setGrade(INTRO.from + (INTRO.to - INTRO.from) * easeInOutCubic(t));
        if (t < 1) rafRef.current = requestAnimationFrame(step);
        else {
          rafRef.current = 0;
          setAnimating(false);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    };
    if (typeof IntersectionObserver === "undefined") {
      // No way to know when it's seen: show the illustrative grade on the next frame.
      doneRef.current = true;
      const raf = requestAnimationFrame(() => setGrade(INTRO.to));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= INTRO.visibleRatio) {
          io.disconnect();
          play();
        }
      },
      { threshold: [INTRO.visibleRatio] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const g = inclineGeometry(grade, 100);
  // While the introduction runs the grade shows a decimal, so every number agrees with the drawing.
  const gradeLabel = animating ? `${one(grade)}%` : `${Math.round(grade)}%`;

  // Drawing: origin at the foot of the slope, 420 units of horizontal distance.
  const ox = 70;
  const oy = 250;
  const L = 420;
  const rise = (L * g.gradePct) / 100;
  const tx = ox + L;
  const ty = oy - rise;
  const rad = (g.angleDeg * Math.PI) / 180;
  const arcR = 70;
  const arcEnd = [ox + arcR * Math.cos(rad), oy - arcR * Math.sin(rad)];
  // Angle label: inside the wedge once it is wide enough; above the slope when shallow.
  const inside = g.angleDeg >= 9;
  const labelRad = inside ? rad / 2 : rad + (14 * Math.PI) / 180;
  const labelR = inside ? arcR + 34 : arcR + 40;
  const angleLabel = [ox + labelR * Math.cos(labelRad), oy - labelR * Math.sin(labelRad) + 6];
  // Surface label: two-thirds along the slope, just above it, along its angle.
  const at = [ox + L * 0.66, oy - rise * 0.66];
  const surfaceLabel = [at[0] - Math.sin(rad) * 22, at[1] - Math.cos(rad) * 22];
  // Rise label: beside the rise line, never down on the baseline.
  const riseY = Math.min(oy - 12, oy - rise / 2 + 6);

  const valueText = `${Math.round(grade)} percent grade: ${one(g.angleDeg)} degrees, rising ${one(g.rise)} feet over 100 feet`;

  return (
    <div ref={rootRef} data-slot="incline-diagram" data-animating={animating ? "" : undefined}>
      <svg viewBox="0 40 680 300" role="img" aria-labelledby={`${id}-title`} className="w-full text-foreground">
        <title id={`${id}-title`}>
          {`A slope drawn to scale at ${Math.round(grade)} percent grade. Over 100 feet of horizontal distance it rises ${one(g.rise)} feet, at an angle of ${one(g.angleDeg)} degrees, with a surface ${one(g.slopeLength)} feet long.`}
        </title>
        {/* Level reference, labelled at the left, below the line */}
        <line x1={14} y1={oy} x2={666} y2={oy} stroke="currentColor" strokeOpacity={0.35} strokeDasharray="4 6" />
        <text x={14} y={oy + 26} className={cn(T, "fill-current")} fillOpacity={0.7}>
          Level
        </text>

        {/* Area under the slope */}
        <polygon points={`${ox},${oy} ${tx},${oy} ${tx},${ty}`} className="fill-current" fillOpacity={0.06} />

        {/* Rise */}
        {rise > 0.5 && <line x1={tx} y1={oy} x2={tx} y2={ty} stroke="currentColor" strokeWidth={1.5} />}
        {rise > 16 && <path d={`M${tx - 12} ${oy} V${oy - 12} H${tx}`} fill="none" stroke="currentColor" strokeOpacity={0.5} />}
        <text data-slot="incline-rise-label" x={tx + 12} y={riseY} className={cn(T, "fill-current font-semibold")}>
          Rise {one(g.rise)} ft
        </text>

        {/* Horizontal distance, as a dimension line below the drawing */}
        <g stroke="currentColor" strokeWidth={1.25}>
          <line x1={ox} y1={oy + 40} x2={tx} y2={oy + 40} />
          <line x1={ox} y1={oy + 32} x2={ox} y2={oy + 48} />
          <line x1={tx} y1={oy + 32} x2={tx} y2={oy + 48} />
        </g>
        <text x={ox + L / 2} y={oy + 74} textAnchor="middle" className={cn(T, "fill-current max-sm:hidden")}>
          Horizontal distance: 100 ft
        </text>
        <text x={ox + L / 2} y={oy + 74} textAnchor="middle" className={cn(T, "fill-current sm:hidden")}>
          Horizontal 100 ft
        </text>

        {/* Angle */}
        {g.angleDeg > 0.2 && (
          <path d={`M${ox + arcR} ${oy} A${arcR} ${arcR} 0 0 0 ${arcEnd[0]} ${arcEnd[1]}`} fill="none" stroke="currentColor" strokeOpacity={0.6} />
        )}
        <text data-slot="incline-angle-label" x={angleLabel[0]} y={angleLabel[1]} textAnchor="middle" className={cn(T, "fill-current")} fillOpacity={0.8}>
          {one(g.angleDeg)}°
        </text>

        {/* Running surface */}
        <line x1={ox} y1={oy} x2={tx} y2={ty} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
        {/* Along the surface (not the horizontal distance); shorter wording where the drawing is small. */}
        {[
          ["max-sm:hidden", `Along the surface: ${one(g.slopeLength)} ft`],
          ["sm:hidden", `Surface ${one(g.slopeLength)} ft`],
        ].map(([cls, text]) => (
          <text
            key={cls}
            data-slot="incline-surface-label"
            x={surfaceLabel[0]}
            y={surfaceLabel[1]}
            textAnchor="middle"
            transform={`rotate(${-g.angleDeg} ${surfaceLabel[0]} ${surfaceLabel[1]})`}
            className={cn(T, "fill-current", cls)}
          >
            {text}
          </text>
        ))}
      </svg>

      <div className="mt-6 flex flex-col gap-6">
        <dl data-slot="incline-readout" className="grid grid-cols-3 gap-4">
          {[
            ["Grade", gradeLabel],
            ["Angle", `${one(g.angleDeg)}°`],
            ["Rise", `${one(g.rise)} ft`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[11px] leading-4 tracking-[0.08em] text-foreground/70 uppercase sm:text-[12px]">{k}</dt>
              <dd className="mt-1 text-[22px] leading-8 font-semibold tabular-nums sm:text-[24px]">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-grade`} className="text-p-sm font-medium">
            Grade
          </label>
          <input
            id={`${id}-grade`}
            type="range"
            min={GRADE_RANGE.min}
            max={GRADE_RANGE.max}
            step={GRADE_RANGE.step}
            value={Math.round(grade)}
            onPointerDown={cancel}
            onKeyDown={cancel}
            onChange={(e) => {
              cancel();
              setGrade(Number(e.target.value));
            }}
            aria-valuetext={valueText}
            aria-describedby={`${id}-note`}
            className={cn("h-11 w-full cursor-pointer accent-foreground", "rounded-xs outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2")}
          />
          <div aria-hidden className="flex justify-between font-mono text-[12px] leading-4 text-foreground/70">
            <span>0%</span>
            <span>45%</span>
          </div>
        </div>
        <p id={`${id}-note`} className="text-p-sm text-foreground/75">
          Geometry only. The drawing and numbers show how grade, angle and rise relate on a uniform slope, drawn to scale.
          They do not estimate effort, oxygen use or calories.
        </p>
      </div>
    </div>
  );
}
