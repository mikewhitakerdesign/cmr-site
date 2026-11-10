"use client";

import { useId, useState } from "react";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/input";
import { ACCUMULATOR, accumulatedGain, formatFeet, formatMeters, parseWhole } from "@/lib/science";

/**
 * Training figure: gain per climb × completed repeats = accumulated gain.
 * Recalculates as you type; invalid entries show an inline error and the
 * total shows a dash until both fields are valid. No animation.
 *
 * The drawing beneath is the same arithmetic in two lines on one scale: the
 * hill's own profile repeated (a sawtooth that never gets taller) and the
 * running total (a staircase that keeps climbing).
 */
export function ElevationAccumulator() {
  const id = useId();
  const [gainRaw, setGainRaw] = useState(String(ACCUMULATOR.gain.initial));
  const [repeatsRaw, setRepeatsRaw] = useState(String(ACCUMULATOR.repeats.initial));
  const gain = parseWhole(gainRaw, ACCUMULATOR.gain);
  const repeats = parseWhole(repeatsRaw, ACCUMULATOR.repeats);
  const total = gain.ok && repeats.ok ? accumulatedGain(gain.value, repeats.value) : null;

  const gainId = `${id}-gain`;
  const repeatsId = `${id}-repeats`;

  return (
    <div data-slot="elevation-accumulator">
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        <Field id={gainId} label={`${ACCUMULATOR.gain.label} (ft)`} error={gain.ok ? undefined : gain.error}>
          <Input
            id={gainId}
            inputMode="numeric"
            autoComplete="off"
            value={gainRaw}
            onChange={(e) => setGainRaw(e.target.value)}
            aria-invalid={gain.ok ? undefined : true}
            aria-describedby={gain.ok ? undefined : `${gainId}-error`}
            className="h-12 text-[18px] tabular-nums"
          />
        </Field>
        <Field id={repeatsId} label={ACCUMULATOR.repeats.label} error={repeats.ok ? undefined : repeats.error}>
          <Input
            id={repeatsId}
            inputMode="numeric"
            autoComplete="off"
            value={repeatsRaw}
            onChange={(e) => setRepeatsRaw(e.target.value)}
            aria-invalid={repeats.ok ? undefined : true}
            aria-describedby={repeats.ok ? undefined : `${repeatsId}-error`}
            className="h-12 text-[18px] tabular-nums"
          />
        </Field>
        <div className="sm:col-span-2">
          <p id={`${id}-total-label`} className="text-p-sm font-medium">
            Total accumulated gain
          </p>
          <output
            htmlFor={`${gainId} ${repeatsId}`}
            aria-labelledby={`${id}-total-label`}
            aria-live="polite"
            data-slot="accumulator-total"
            className="mt-1.5 block text-[44px] leading-[48px] font-black tracking-[-0.03em] tabular-nums md:text-[52px] md:leading-[56px]"
          >
            {total === null ? "–" : formatFeet(total)}
          </output>
          <p className="mt-1 text-p-sm text-muted-foreground tabular-nums">{total === null ? "Enter both values" : `About ${formatMeters(total)}`}</p>
        </div>
      </div>

      <AccumulationDrawing gain={gain.ok ? gain.value : null} repeats={repeats.ok ? repeats.value : null} />
    </div>
  );
}

function AccumulationDrawing({ gain, repeats }: { gain: number | null; repeats: number | null }) {
  const W = 880;
  const H = 180;
  const left = 4;
  const right = W - 4;
  const base = H - 8;
  const top = 12;
  if (gain === null || repeats === null) {
    return <div aria-hidden className="mt-8 h-[180px] max-md:h-[120px]" />;
  }
  const total = gain * repeats;
  const step = (right - left) / repeats;
  const y = (ft: number) => base - (ft / total) * (base - top);
  let saw = `M${left} ${base}`;
  let stairs = `M${left} ${base}`;
  for (let i = 0; i < repeats; i++) {
    const x0 = left + i * step;
    const xm = x0 + step * 0.55;
    const x1 = x0 + step;
    saw += ` L${xm} ${y(gain)} L${x1} ${base}`;
    stairs += ` L${xm} ${y(gain * (i + 1))} L${x1} ${y(gain * (i + 1))}`;
  }
  return (
    <figure aria-hidden className="mt-8">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[120px] w-full text-foreground md:h-[180px]">
        <line x1={left} x2={right} y1={base} y2={base} stroke="currentColor" strokeOpacity={0.3} vectorEffect="non-scaling-stroke" />
        <path d={`${stairs} L${right} ${base} Z`} className="fill-current" fillOpacity={0.06} />
        <path d={stairs} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <path d={saw} fill="none" stroke="currentColor" strokeOpacity={0.55} strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-p-sm text-foreground/75">
        <span className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 bg-foreground" />
          Running total
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-px w-6 bg-foreground/55" />
          The hill, each repeat ({formatFeet(gain)})
        </span>
      </figcaption>
    </figure>
  );
}
