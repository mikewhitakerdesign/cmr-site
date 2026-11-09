import { RUNNER } from "@/components/science/runner";
import { cn } from "@/lib/utils";

/**
 * Static scientific diagrams for The Science. Inline SVG, Server Components,
 * monochrome (the text color plus its opacities; no accent colors), and
 * crisp at any pixel ratio. Text that must stay legible on phones lives in
 * HTML next to the drawing, keyed to numbered markers, rather than inside a
 * scaled-down SVG.
 */

const Arrowhead = ({ x, y, angle, open = false }: { x: number; y: number; angle: number; open?: boolean }) => (
  <path
    d="M0 0 L-11 -6 L-11 6 Z"
    transform={`translate(${x} ${y}) rotate(${angle})`}
    className={open ? "fill-background" : "fill-current"}
    stroke="currentColor"
    strokeWidth={open ? 1.75 : 0}
    strokeLinejoin="round"
  />
);

/* ------------------------------------------------------------------ */
/* Physiology: a runner pushing off uphill                             */
/* ------------------------------------------------------------------ */

export const JOINT_ACTIONS: { joint: string; muscles: string; action: string }[] = [
  {
    joint: "Hip extensors",
    muscles: "Gluteus maximus, with the hamstrings",
    action: "Extend the hip, driving the body up and forward. The hip supplies a larger share of the work on steeper grades at faster speeds.",
  },
  { joint: "Knee extensors", muscles: "Quadriceps", action: "Straighten the knee against body weight during stance." },
  { joint: "Ankle plantar flexors", muscles: "Gastrocnemius and soleus (the calf)", action: "Push the foot against the slope toward the end of stance." },
];

/** Stroke under, fill over: overlapping parts read as one continuous outline. */
function Silhouette({ paths, className, width }: { paths: string[]; className: string; width: number }) {
  return (
    <g className={className}>
      {paths.map((d, i) => (
        <path key={`s${i}`} d={d} fill="none" stroke="currentColor" strokeWidth={width * 2} strokeLinejoin="round" />
      ))}
      {paths.map((d, i) => (
        <path key={`f${i}`} d={d} className="fill-background" />
      ))}
    </g>
  );
}

const LABELS = [
  { key: "gluteus", text: "Gluteus maximus", x: 40, y: 262, anchor: "start" },
  { key: "quadriceps", text: "Quadriceps", x: 520, y: 462, anchor: "end" },
  { key: "calf", text: "Calf muscles", x: 40, y: 400, anchor: "start" },
] as const;

/**
 * Figure 3 (refinement pass, Owner direction 2026-11-09): a technical line
 * drawing of a runner pushing off up a 10° slope, in the manner of an exercise
 * physiology textbook figure: one continuous outline, the far limbs in gray,
 * the three muscle groups the text names hatched in place and labelled with
 * short leader lines. Geometry: ./runner.ts. Each group's joint action is in
 * the text beside it (JOINT_ACTIONS, rendered by the Physiology section), so
 * the framed drawing stays short enough to remain in view.
 */
export function RunnerIllustration() {
  const { ground, anchors, muscles } = RUNNER;
  return (
    <div data-slot="runner-illustration">
      <svg
        viewBox="30 70 500 460"
        role="img"
        aria-label="Side view of a runner pushing off up a slope, leaning into the hill, with the trailing leg extended and the other knee driven forward. The gluteus maximus behind the hip, the quadriceps along the front of the thigh and the calf muscles on the back of the lower leg are hatched and labelled on the pushing leg."
        className="w-full text-foreground"
      >
        <defs>
          <pattern id="runner-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" strokeWidth={1.1} />
          </pattern>
        </defs>
        <line {...ground} stroke="currentColor" strokeWidth={2} />
        <Silhouette paths={RUNNER.farArm} className="text-foreground/40" width={1} />
        <Silhouette paths={RUNNER.farLeg} className="text-foreground/40" width={1} />
        <Silhouette paths={RUNNER.body} className="text-foreground" width={1.25} />
        <g stroke="currentColor" strokeWidth={1.1}>
          <path d={muscles.gluteus} fill="url(#runner-hatch)" />
          <path d={muscles.quadriceps} fill="url(#runner-hatch)" />
          <path d={muscles.calf} fill="url(#runner-hatch)" />
        </g>
        <path d={RUNNER.ear} fill="none" stroke="currentColor" strokeWidth={1.1} />
        <Silhouette paths={RUNNER.nearArm} className="text-foreground" width={1.25} />
        {LABELS.map((l) => {
          const a = anchors[l.key];
          const textEnd = l.anchor === "start" ? l.x + 8 : l.x - 8;
          const lineY = l.y + 9;
          return (
            <g key={l.key} data-slot={`label-${l.key}`}>
              <polyline
                points={`${l.anchor === "start" ? l.x : l.x} ${lineY} ${l.anchor === "start" ? textEnd + 140 : textEnd - 110} ${lineY} ${a.x} ${a.y}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
              />
              <circle cx={a.x} cy={a.y} r={3} className="fill-current" />
              <text x={l.x} y={l.y} textAnchor={l.anchor} className="fill-current text-[19px] font-semibold">
                {l.text}
              </text>
            </g>
          );
        })}
      </svg>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The Mind: one hill, again and again                                 */
/* ------------------------------------------------------------------ */

function repeatPath(count: number, unit: number, base: number, peak: number, startX: number) {
  // Each repeat: a short flat recovery, a climb, a brief top, a descent.
  const flat = unit * 0.18;
  const up = unit * 0.42;
  const top = unit * 0.06;
  const down = unit * 0.34;
  let x = startX;
  let d = `M${x} ${base}`;
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    x += flat;
    d += ` L${x} ${base}`;
    x += up;
    d += ` L${x} ${peak}`;
    peaks.push(x + top / 2);
    x += top;
    d += ` L${x} ${peak}`;
    x += down;
    d += ` L${x} ${base}`;
  }
  d += ` L${x + flat} ${base}`;
  return { d, peaks, end: x + flat };
}

function Waveform({ count, width, className }: { count: number; width: number; className?: string }) {
  const unit = (width - 40) / (count + 0.18);
  const base = 150;
  const peak = 62;
  const { d, peaks, end } = repeatPath(count, unit, base, peak, 20);
  const first = [20 + unit * 0.18, 20 + unit];
  return (
    <svg viewBox={`0 0 ${width} 210`} aria-hidden className={cn("w-full text-foreground", className)}>
      <line x1={0} y1={base} x2={width} y2={base} stroke="currentColor" strokeOpacity={0.25} strokeDasharray="4 6" />
      <path d={`${d} L${end} ${base} Z`} className="fill-current" fillOpacity={0.05} />
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />
      {/* One repeat, bracketed */}
      <path d={`M${first[0]} 36 V28 H${first[1]} V36`} fill="none" stroke="currentColor" strokeOpacity={0.6} />
      <text x={(first[0] + first[1]) / 2} y={18} textAnchor="middle" className="fill-current text-[18px]" fillOpacity={0.75}>
        One repeat
      </text>
      {peaks.map((x, i) => (
        <text key={i} x={x} y={base + 36} textAnchor="middle" className="fill-current font-mono text-[18px]" fillOpacity={0.65}>
          {i + 1}
        </text>
      ))}
    </svg>
  );
}

export function RepeatWaveform() {
  return (
    <div data-slot="repeat-waveform">
      {/* Six repeats where the figure is narrow (phones, and beside the text from 1280); twelve where it spans the column. */}
      <Waveform count={6} width={640} className="md:hidden xl:block" />
      <Waveform count={12} width={1240} className="hidden md:block xl:hidden" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Descending: the same hill, two different jobs                       */
/* ------------------------------------------------------------------ */

export function AscentDescentDiagram() {
  const base = 250;
  const peakY = 70;
  const up = { x0: 110, x1: 380 };
  const down = { x0: 420, x1: 690 };
  const slopeUp = (x: number) => base - ((x - up.x0) / (up.x1 - up.x0)) * (base - peakY);
  const slopeDown = (x: number) => peakY + ((x - down.x0) / (down.x1 - down.x0)) * (base - peakY);
  const angUp = (Math.atan2(-(base - peakY), up.x1 - up.x0) * 180) / Math.PI; // pointing up-slope
  const angDown = (Math.atan2(base - peakY, down.x1 - down.x0) * 180) / Math.PI; // pointing down-slope
  const n = (deg: number) => [Math.sin((deg * Math.PI) / 180), -Math.cos((deg * Math.PI) / 180)];
  const [nux, nuy] = n(angUp);
  const [ndx, ndy] = n(angDown);
  const off = 26;

  return (
    <div data-slot="ascent-descent">
      <svg
        viewBox="0 0 800 300"
        role="img"
        aria-label="One hill profile. On the ascent, solid arrows point up the slope: propulsion. On the descent, the direction of travel is down the slope while open arrows point back up it: braking."
        className="w-full max-w-[900px] text-foreground"
      >
        <path
          d={`M30 ${base} L${up.x0} ${base} L${up.x1} ${peakY} Q400 ${peakY - 10} ${down.x0} ${peakY} L${down.x1} ${base} L770 ${base} Z`}
          className="fill-current"
          fillOpacity={0.05}
        />
        <line x1={30} y1={base} x2={770} y2={base} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="4 6" />
        <path d={`M30 ${base} L${up.x0} ${base} L${up.x1} ${peakY} Q400 ${peakY - 10} ${down.x0} ${peakY}`} fill="none" stroke="currentColor" strokeWidth={3} strokeLinejoin="round" />
        <path d={`M${down.x0} ${peakY} L${down.x1} ${base} L770 ${base}`} fill="none" stroke="currentColor" strokeWidth={3} strokeDasharray="10 7" strokeLinejoin="round" />
        <line x1={400} y1={peakY - 18} x2={400} y2={base + 8} stroke="currentColor" strokeOpacity={0.2} />

        {/* Ascent: propulsion, solid arrows up the slope */}
        {[0.25, 0.5, 0.75].map((t) => {
          const x = up.x0 + t * (up.x1 - up.x0);
          const y = slopeUp(x);
          const ax = x + nux * off;
          const ay = y + nuy * off;
          const dx = Math.cos((angUp * Math.PI) / 180) * 34;
          const dy = Math.sin((angUp * Math.PI) / 180) * 34;
          return (
            <g key={t}>
              <line x1={ax - dx} y1={ay - dy} x2={ax} y2={ay} stroke="currentColor" strokeWidth={2.5} />
              <Arrowhead x={ax + dx * 0.25} y={ay + dy * 0.25} angle={angUp} />
            </g>
          );
        })}

        {/* Descent: travel down the slope (thin), braking back up it (open arrows) */}
        {[0.25, 0.5, 0.75].map((t) => {
          const x = down.x0 + t * (down.x1 - down.x0);
          const y = slopeDown(x);
          const ax = x + ndx * off;
          const ay = y + ndy * off;
          const dx = Math.cos((angDown * Math.PI) / 180) * 30;
          const dy = Math.sin((angDown * Math.PI) / 180) * 30;
          return (
            <g key={t}>
              <line x1={ax + dx} y1={ay + dy} x2={ax} y2={ay} stroke="currentColor" strokeWidth={2} />
              <Arrowhead x={ax - dx * 0.2} y={ay - dy * 0.2} angle={angDown + 180} open />
            </g>
          );
        })}

        <text x={(up.x0 + up.x1) / 2 - 40} y={base + 34} textAnchor="middle" className="fill-current font-mono text-[18px] tracking-[0.1em]">
          ASCENT
        </text>
        <text x={(down.x0 + down.x1) / 2 + 40} y={base + 34} textAnchor="middle" className="fill-current font-mono text-[18px] tracking-[0.1em]">
          DESCENT
        </text>
      </svg>

      <div className="mt-8 grid max-w-[900px] gap-8 md:grid-cols-2 md:gap-12">
        {[
          {
            title: "Ascent",
            key: "Solid line, solid arrows",
            rows: [
              ["Main job", "Propulsion: pushing the body up and forward"],
              ["Muscle action", "Concentric emphasis: muscles shorten while producing force"],
              ["Energy", "Positive work: raising body mass against gravity"],
            ],
          },
          {
            title: "Descent",
            key: "Dashed line, open arrows",
            rows: [
              ["Main job", "Braking: slowing the body with each step"],
              ["Muscle action", "Eccentric emphasis: muscles lengthen while producing force"],
              ["Energy", "Absorption: controlling the drop, with the quadriceps doing much of it"],
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <p className="text-[20px] leading-7 font-semibold">{col.title}</p>
            <p className="mt-0.5 font-mono text-[12px] leading-5 tracking-[0.08em] text-foreground/65 uppercase">{col.key}</p>
            <dl className="mt-4 border-b border-foreground/15">
              {col.rows.map(([k, v]) => (
                <div key={k} className="border-t border-foreground/15 py-3">
                  <dt className="text-p-sm text-foreground/65">{k}</dt>
                  <dd className="mt-0.5 text-[17px] leading-[26px]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Workouts: small profile icons                                       */
/* ------------------------------------------------------------------ */

export function WorkoutIcon({ kind }: { kind: "short-steep" | "long-slow" | "up-down" }) {
  const d = {
    "short-steep": "M2 34 H30 L42 6 L50 6 L54 34 H78",
    "long-slow": "M2 34 H8 L66 10 L72 10 L74 34 H78",
    "up-down": "M2 34 H14 L36 8 L44 8 L66 34 H78",
  }[kind];
  return (
    <svg viewBox="0 0 80 40" aria-hidden className="h-10 w-20 text-foreground">
      <path d={`${d} V40 H2 Z`} className="fill-current" fillOpacity={0.08} />
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {kind === "up-down" && <path d="M44 8 L66 34" fill="none" stroke="currentColor" strokeWidth={2.5} strokeDasharray="4 3" className="text-background" />}
    </svg>
  );
}
