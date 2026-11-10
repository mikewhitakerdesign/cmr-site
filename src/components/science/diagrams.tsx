import { RUNNER } from "@/components/science/runner";
import { grayTintVars } from "@/lib/tints";
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

const MUSCLE_KEY = [
  { key: "gluteus", n: 1, name: "Gluteus maximus" },
  { key: "quadriceps", n: 2, name: "Quadriceps" },
  { key: "calf", n: 3, name: "Calf (gastrocnemius, soleus)" },
] as const;

/**
 * Figure 3: one solid silhouette of a runner driving up a slope (geometry and
 * provenance: ./runner.ts), with three numbered markers over the push-off leg
 * (the gluteus maximus behind the hip, the quadriceps on the front of the
 * thigh, the calf muscles behind the shank) and a key beneath. No overlays and
 * no leader lines. Each group's joint action is in the text beside it
 * (JOINT_ACTIONS, rendered by the Physiology section).
 */
export function RunnerIllustration() {
  const { ground, markers, silhouette } = RUNNER;
  return (
    <div data-slot="runner-illustration">
      <svg
        viewBox="20 30 260 300"
        role="img"
        aria-label="Silhouette of a runner driving up a slope, leaning into the hill, the trailing leg extended behind and the other knee driven forward. Numbered markers on the pushing leg show 1, the gluteus maximus behind the hip; 2, the quadriceps on the front of the thigh; and 3, the calf muscles behind the lower leg."
        className="mx-auto w-full max-w-[380px] text-foreground"
      >
        <line {...ground} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
        <path data-slot="runner-silhouette" d={silhouette} className="fill-current" />
        {MUSCLE_KEY.map(({ key, n }) => (
          <g key={key} data-slot={`marker-${key}`}>
            <circle cx={markers[key].x} cy={markers[key].y} r={10} className="fill-background stroke-current" strokeWidth={1.5} />
            <text x={markers[key].x} y={markers[key].y + 4.5} textAnchor="middle" className="fill-current text-[13px] font-bold">
              {n}
            </text>
          </g>
        ))}
      </svg>
      <ol data-slot="muscle-key" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-p-sm">
        {MUSCLE_KEY.map(({ n, name }) => (
          <li key={n} className="flex items-start gap-2">
            <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[12px] font-bold text-background">
              {n}
            </span>
            <span className="pt-0.5 font-medium">
              <span className="sr-only">{n}. </span>
              {name}
            </span>
          </li>
        ))}
      </ol>
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
        aria-label="One hill profile. On the ascent, solid arrows point up the slope: propulsion. On the descent, open arrows point down the slope, from the summit toward the bottom, where braking and eccentric loading take over."
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
            <g key={t} data-slot="ascent-arrow">
              <line x1={ax - dx} y1={ay - dy} x2={ax} y2={ay} stroke="currentColor" strokeWidth={2.5} />
              <Arrowhead x={ax + dx * 0.25} y={ay + dy * 0.25} angle={angUp} />
            </g>
          );
        })}

        {/* Descent: open arrows pointing down the slope, from the summit toward the bottom */}
        {[0.25, 0.5, 0.75].map((t) => {
          const x = down.x0 + t * (down.x1 - down.x0);
          const y = slopeDown(x);
          const ax = x + ndx * off;
          const ay = y + ndy * off;
          const dx = Math.cos((angDown * Math.PI) / 180) * 30;
          const dy = Math.sin((angDown * Math.PI) / 180) * 30;
          return (
            <g key={t} data-slot="descent-arrow">
              <line x1={ax - dx} y1={ay - dy} x2={ax} y2={ay} stroke="currentColor" strokeWidth={2} />
              <Arrowhead x={ax + dx * 0.25} y={ay + dy * 0.25} angle={angDown} open />
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

/**
 * Workout icons (final pass, Owner direction 2026-11-09): thin black line
 * drawings, one stroke weight and one scale, each in a circle filled with the
 * homepage TBD circles' grayscale tie-dye.
 *   short-steep  a narrow, steep hill in side profile
 *   long-slow    a wider hill at a gentler gradient
 *   up-down      two thin diagonal arrows, one uphill and one downhill
 */
export function WorkoutIcon({ kind }: { kind: "short-steep" | "long-slow" | "up-down" }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <span
      data-slot="workout-icon"
      style={grayTintVars}
      className="relative isolate flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--tie-wash) text-foreground md:size-28"
    >
      <span aria-hidden className="cmr-tie-dye absolute -z-10" />
      <svg viewBox="0 0 48 48" aria-hidden className="size-12 md:size-14">
        {kind === "short-steep" && <path d="M6 36 H17 L23 12 H26 L32 36 H42" {...stroke} />}
        {kind === "long-slow" && <path d="M4 36 H8 L27 22 H31 L44 36" {...stroke} />}
        {kind === "up-down" && (
          <>
            {/* Uphill: up and to the right. */}
            <path d="M8 30 L28 12" {...stroke} />
            <path d="M21.5 12.5 H28 V19" {...stroke} />
            {/* Downhill: back down and to the left. */}
            <path d="M40 18 L20 36" {...stroke} />
            <path d="M26.5 35.5 H20 V29" {...stroke} />
          </>
        )}
      </svg>
    </span>
  );
}
