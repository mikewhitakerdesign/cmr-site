import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Static scientific diagrams for The Science. Inline SVG, Server Components,
 * monochrome (the text color plus its opacities; no accent colors), and
 * crisp at any pixel ratio. Text that must stay legible on phones lives in
 * HTML next to the drawing, keyed to numbered markers, rather than inside a
 * scaled-down SVG.
 */

const Marker = ({ x, y, n }: { x: number; y: number; n: number }) => (
  <g>
    <circle cx={x} cy={y} r={15} className="fill-current" />
    <text x={x} y={y + 6} textAnchor="middle" className="fill-background text-[17px] font-semibold">
      {n}
    </text>
  </g>
);

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

/** An arc around (cx, cy) from a0 to a1 degrees (screen angles, clockwise from +x). */
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return { d: `M${x0} ${y0} A${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`, start: [x0, y0], end: [x1, y1] };
}

/* ------------------------------------------------------------------ */
/* Physiology: joint actions in uphill stance                          */
/* ------------------------------------------------------------------ */

export const JOINT_ACTIONS: { n: number; joint: string; muscles: string; action: string }[] = [
  {
    n: 1,
    joint: "Hip extensors",
    muscles: "Gluteus maximus and hamstrings",
    action: "Extend the hip, driving the body up and forward. The hip supplies a larger share of the work on steeper grades at faster speeds.",
  },
  { n: 2, joint: "Knee extensors", muscles: "Quadriceps", action: "Straighten the knee against body weight during stance." },
  { n: 3, joint: "Ankle plantar flexors", muscles: "Gastrocnemius and soleus (the calf)", action: "Push the foot against the slope toward the end of stance." },
];

export function JointActionDiagram({ citeHip }: { citeHip?: ReactNode }) {
  // A 10° incline (≈ 17.5% grade).
  const s = (x: number) => 380 - (x - 20) * 0.175;
  const hip = [252, 170];
  const knee = [300, 246];
  const ankle = [262, 318];
  const heel = [248, s(248) - 3];
  const toe = [302, s(302) - 3];
  const shoulder = [290, 66];

  const hipArc = arc(hip[0], hip[1], 38, 30, 100);
  const kneeArc = arc(knee[0], knee[1], 30, 140, 215);
  const ankleArc = arc(ankle[0], ankle[1], 30, -15, 55);

  return (
    <div data-slot="joint-diagram" className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center lg:gap-16">
      <svg
        viewBox="0 0 560 400"
        role="img"
        aria-label="Schematic of a runner's stance leg on a 10 degree incline, with the trunk leaning into the slope. Numbered markers show the hip, knee and ankle; curved arrows show each joint extending to push the body up the slope."
        className="w-full max-w-[560px] text-foreground"
      >
        {/* Slope */}
        <path d={`M20 ${s(20)} L540 ${s(540)} L540 400 L20 400 Z`} className="fill-current" fillOpacity={0.05} />
        <line x1={20} y1={s(20)} x2={540} y2={s(540)} stroke="currentColor" strokeWidth={2} />
        <line x1={20} y1={380} x2={540} y2={380} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="4 6" />

        {/* Direction of travel */}
        <line x1={372} y1={s(372) - 34} x2={470} y2={s(470) - 34} stroke="currentColor" strokeOpacity={0.6} strokeWidth={1.5} />
        <Arrowhead x={474} y={s(474) - 34} angle={-9.93} />
        <text x={421} y={s(421) - 50} textAnchor="middle" transform={`rotate(-9.93 421 ${s(421) - 50})`} className="fill-current text-[17px]" fillOpacity={0.7}>
          Up the slope
        </text>

        {/* Trailing (swing) leg, in gray */}
        <polyline
          points={`${hip[0]},${hip[1]} 220,236 178,272 162,266`}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.28}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Trunk and head */}
        <line x1={hip[0]} y1={hip[1]} x2={shoulder[0]} y2={shoulder[1]} stroke="currentColor" strokeWidth={9} strokeLinecap="round" />
        <circle cx={301} cy={36} r={17} className="fill-current" />

        {/* Stance leg */}
        <polyline
          points={`${hip[0]},${hip[1]} ${knee[0]},${knee[1]} ${ankle[0]},${ankle[1]}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline points={`${ankle[0]},${ankle[1]} ${heel[0]},${heel[1]} ${toe[0]},${toe[1]} ${ankle[0]},${ankle[1]}`} className="fill-current" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" />

        {/* Joint actions */}
        <g fill="none" stroke="currentColor" strokeWidth={2}>
          <path d={hipArc.d} />
          <path d={kneeArc.d} />
          <path d={ankleArc.d} />
        </g>
        <Arrowhead x={hipArc.end[0]} y={hipArc.end[1]} angle={190} />
        <Arrowhead x={kneeArc.start[0]} y={kneeArc.start[1]} angle={50} />
        <Arrowhead x={kneeArc.end[0]} y={kneeArc.end[1]} angle={305} />
        <Arrowhead x={ankleArc.end[0]} y={ankleArc.end[1]} angle={145} />

        {/* Joints */}
        {[hip, knee, ankle].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={7} className="fill-background" stroke="currentColor" strokeWidth={2.5} />
        ))}

        {/* Numbered markers */}
        <line x1={hip[0] - 8} y1={hip[1] - 4} x2={196} y2={150} stroke="currentColor" strokeOpacity={0.5} />
        <Marker x={184} y={146} n={1} />
        <line x1={knee[0] + 8} y1={knee[1] - 2} x2={352} y2={236} stroke="currentColor" strokeOpacity={0.5} />
        <Marker x={366} y={232} n={2} />
        <line x1={ankle[0] - 8} y1={ankle[1]} x2={214} y2={308} stroke="currentColor" strokeOpacity={0.5} />
        <Marker x={200} y={306} n={3} />
      </svg>

      <ol className="flex flex-col border-b border-foreground/15">
        {JOINT_ACTIONS.map((j) => (
          <li key={j.n} className="grid grid-cols-[32px_minmax(0,1fr)] gap-4 border-t border-foreground/15 py-5">
            <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-foreground text-[15px] font-semibold text-background">
              {j.n}
            </span>
            <div>
              <p className="text-[18px] leading-[26px] font-semibold">
                <span className="sr-only">{j.n}. </span>
                {j.joint}
              </p>
              <p className="mt-0.5 text-p-sm text-foreground/70">{j.muscles}</p>
              <p className="mt-2 text-[17px] leading-[27px] text-foreground/85">
                {j.action}
                {j.n === 1 && citeHip ? <> {citeHip}</> : null}
              </p>
            </div>
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
      <Waveform count={6} width={640} className="md:hidden" />
      <Waveform count={12} width={1240} className="hidden md:block" />
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
