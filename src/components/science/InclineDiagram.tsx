"use client";

import { useId, useState } from "react";
import { GRADE_RANGE, inclineGeometry } from "@/lib/science";
import { cn } from "@/lib/utils";

const one = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Physics figure: grade, angle, rise and horizontal distance on a uniform
 * slope, drawn to scale (no vertical exaggeration). The slider changes only
 * the geometry. It is labelled as geometry, not a physiological calculator,
 * and computes nothing about effort.
 *
 * Monochrome: black for the surface and dimensions, neutral grays for the
 * reference line and construction marks.
 */
export function InclineDiagram() {
  const id = useId();
  const [grade, setGrade] = useState<number>(GRADE_RANGE.initial);
  const g = inclineGeometry(grade, 100);

  // Drawing: origin at the foot of the slope, 440 units of horizontal distance.
  const ox = 90;
  const oy = 262;
  const L = 440;
  const rise = (L * g.gradePct) / 100;
  const tx = ox + L;
  const ty = oy - rise;
  const rad = (g.angleDeg * Math.PI) / 180;
  const arcR = 78;
  const arcEnd = [ox + arcR * Math.cos(rad), oy - arcR * Math.sin(rad)];
  const labelAngle = rad / 2;
  const angleLabel = [ox + (arcR + 34) * Math.cos(labelAngle), oy - (arcR + 34) * Math.sin(labelAngle) + 8];
  const mid = [ox + L / 2, oy - rise / 2];
  const normal = [-Math.sin(rad), -Math.cos(rad)];
  const surfaceLabel = [mid[0] + normal[0] * 22, mid[1] + normal[1] * 22];

  const valueText = `${grade} percent grade: ${one(g.angleDeg)} degrees, rising ${one(g.rise)} feet over 100 feet`;

  return (
    <div data-slot="incline-diagram">
      <svg
        viewBox="0 0 640 330"
        role="img"
        aria-labelledby={`${id}-title`}
        className="w-full max-w-[760px] overflow-visible text-foreground"
      >
        <title id={`${id}-title`}>
          {`A slope drawn to scale at ${grade} percent grade. Over 100 feet of horizontal distance it rises ${one(g.rise)} feet, at an angle of ${one(g.angleDeg)} degrees, with a surface ${one(g.slopeLength)} feet long.`}
        </title>
        {/* Flat reference */}
        <line x1={20} y1={oy} x2={620} y2={oy} stroke="currentColor" strokeOpacity={0.35} strokeDasharray="4 6" />
        <text x={620} y={oy - 10} textAnchor="end" className="fill-current text-[17px]" fillOpacity={0.65}>
          Flat reference
        </text>

        {/* Area under the slope */}
        <polygon points={`${ox},${oy} ${tx},${oy} ${tx},${ty}`} className="fill-current" fillOpacity={0.05} />

        {/* Rise */}
        {rise > 0.5 && (
          <>
            <line x1={tx} y1={oy} x2={tx} y2={ty} stroke="currentColor" strokeWidth={1.5} />
            <path d={`M${tx - 14} ${oy} V${oy - 14} H${tx}`} fill="none" stroke="currentColor" strokeOpacity={0.5} />
          </>
        )}
        <text x={tx + 14} y={oy - rise / 2 + 6} className="fill-current text-[18px] font-semibold">
          Rise {one(g.rise)} ft
        </text>

        {/* Horizontal distance, as a dimension line */}
        <g stroke="currentColor" strokeWidth={1.25}>
          <line x1={ox} y1={oy + 26} x2={tx} y2={oy + 26} />
          <line x1={ox} y1={oy + 18} x2={ox} y2={oy + 34} />
          <line x1={tx} y1={oy + 18} x2={tx} y2={oy + 34} />
        </g>
        <text x={ox + L / 2} y={oy + 56} textAnchor="middle" className="fill-current text-[18px]">
          Horizontal distance 100 ft
        </text>

        {/* Angle */}
        {g.angleDeg > 0.2 && (
          <path d={`M${ox + arcR} ${oy} A${arcR} ${arcR} 0 0 0 ${arcEnd[0]} ${arcEnd[1]}`} fill="none" stroke="currentColor" strokeOpacity={0.55} />
        )}
        <text x={angleLabel[0]} y={angleLabel[1]} className="fill-current text-[17px]" fillOpacity={0.75}>
          {one(g.angleDeg)}°
        </text>

        {/* Running surface */}
        <line x1={ox} y1={oy} x2={tx} y2={ty} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
        <text
          x={surfaceLabel[0]}
          y={surfaceLabel[1]}
          textAnchor="middle"
          transform={`rotate(${-g.angleDeg} ${surfaceLabel[0]} ${surfaceLabel[1]})`}
          className="fill-current text-[17px]"
        >
          Surface {one(g.slopeLength)} ft
        </text>
      </svg>

      <div className="mt-8 grid max-w-[760px] gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-10">
        <div className="flex flex-col gap-3">
          <label htmlFor={`${id}-grade`} className="text-p-sm font-medium">
            Grade
          </label>
          <input
            id={`${id}-grade`}
            type="range"
            min={GRADE_RANGE.min}
            max={GRADE_RANGE.max}
            step={GRADE_RANGE.step}
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            aria-valuetext={valueText}
            aria-describedby={`${id}-note`}
            className={cn(
              "h-11 w-full cursor-pointer accent-foreground",
              "rounded-xs outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          />
          <div aria-hidden className="flex justify-between font-mono text-[12px] leading-4 text-foreground/65">
            <span>0%</span>
            <span>45%</span>
          </div>
        </div>
        <dl data-slot="incline-readout" className="grid grid-cols-3 gap-6 md:gap-8">
          {[
            ["Grade", `${grade}%`],
            ["Angle", `${one(g.angleDeg)}°`],
            ["Rise per 100 ft", `${one(g.rise)} ft`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[12px] leading-4 tracking-[0.08em] text-foreground/65 uppercase">{k}</dt>
              <dd className="mt-1 text-[24px] leading-8 font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p id={`${id}-note`} className="mt-6 max-w-[680px] text-p-sm text-muted-foreground">
        Geometry only. The drawing and numbers show how grade, angle and rise relate on a uniform slope, drawn to scale.
        They do not estimate effort, oxygen use or calories.
      </p>
    </div>
  );
}
