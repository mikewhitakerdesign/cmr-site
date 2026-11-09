"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ctaLinkVariants } from "@/components/CtaLink";
import { BREATH_PATTERNS, breathAt, type BreathPattern } from "@/lib/science";
import { MOTION_EVENT, motionOff } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Status = "idle" | "running" | "paused";

/**
 * Breathing figure: a pattern guide for box breathing (4-4-4-4) and an
 * extended exhale (4 in, 6 out). Nothing starts on its own and there is no
 * sound. Start, Pause/Resume and Reset; switching pattern resets.
 *
 * Timing is real elapsed time (requestAnimationFrame deltas, each capped at
 * 250ms so a hidden tab or a slow frame never skips phases). The loop runs
 * only while running and is cancelled on pause, reset and unmount.
 *
 * Motion: a dot follows the shape at the pace of the breath, the only motion,
 * and it carries the timing. With reduced motion (the site preference, which
 * follows the system setting by default) the dot is hidden and the current
 * side of the shape, the phase name and a once-a-second count carry it
 * instead. Phase changes are announced politely to screen readers.
 */
export function BreathingPacer() {
  const id = useId();
  const [patternId, setPatternId] = useState<BreathPattern["id"]>("box");
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [reduced, setReduced] = useState(false);
  const elapsedRef = useRef(0);
  const pattern = BREATH_PATTERNS.find((p) => p.id === patternId)!;
  const pos = breathAt(pattern, elapsed);

  useEffect(() => {
    const sync = () => setReduced(motionOff());
    sync();
    window.addEventListener(MOTION_EVENT, sync);
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    mq?.addEventListener?.("change", sync);
    return () => {
      window.removeEventListener(MOTION_EVENT, sync);
      mq?.removeEventListener?.("change", sync);
    };
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const prev = elapsedRef.current;
      elapsedRef.current += Math.min(Math.max(0, now - last), 250);
      last = now;
      // With reduced motion only whole seconds matter, so re-render once a second.
      if (!reduced || Math.floor(prev / 1000) !== Math.floor(elapsedRef.current / 1000)) setElapsed(elapsedRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, reduced]);

  const reset = () => {
    setStatus("idle");
    elapsedRef.current = 0;
    setElapsed(0);
  };

  const choose = (next: BreathPattern["id"]) => {
    setPatternId(next);
    reset();
  };

  const active = status !== "idle";
  const primaryLabel = status === "running" ? "Pause" : status === "paused" ? "Resume" : "Start";

  return (
    <div data-slot="breathing-pacer" data-status={status}>
      <fieldset>
        <legend className="text-p-sm font-medium">Pattern</legend>
        <div className="mt-3 inline-flex flex-wrap gap-2">
          {BREATH_PATTERNS.map((p) => (
            <label
              key={p.id}
              className={cn(
                "relative flex h-11 cursor-pointer items-center rounded-md border px-4 text-p-sm font-medium",
                "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                p.id === patternId ? "border-foreground bg-foreground text-background" : "border-foreground/30 hover:border-foreground",
              )}
            >
              <input
                type="radio"
                name={`${id}-pattern`}
                value={p.id}
                checked={p.id === patternId}
                onChange={() => choose(p.id)}
                className="sr-only"
              />
              {p.name}
            </label>
          ))}
        </div>
        <p className="mt-3 text-p-sm text-foreground/75">{pattern.summary} Example timing only.</p>
      </fieldset>

      <div className="mt-8 grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] md:items-center md:gap-12">
        <BreathShape pattern={pattern} index={pos.index} progress={pos.progress} active={active} showDot={active && !reduced} />
        <div>
          <p data-slot="breath-phase" className="text-[40px] leading-[44px] font-black tracking-[-0.03em] md:text-[52px] md:leading-[56px]">
            {active ? pos.phase.label : "Ready"}
          </p>
          <p data-slot="breath-count" aria-hidden className="mt-2 font-mono text-[18px] leading-7 text-foreground/70 tabular-nums">
            {active ? `${pos.remaining} ${pos.remaining === 1 ? "second" : "seconds"} left · ${pattern.phases.map((ph) => ph.seconds).join("-")}` : "Press Start when you're ready."}
          </p>
          <p className="sr-only" aria-live="polite">
            {status === "running" ? `${pos.phase.label}, ${pos.phase.seconds} seconds` : status === "paused" ? "Paused" : ""}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStatus(status === "running" ? "paused" : "running")}
              className={cn(ctaLinkVariants({ variant: "primary" }), "h-11 min-w-[112px] px-5 text-[16px]")}
            >
              {primaryLabel}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={!active}
              className={cn(ctaLinkVariants({ variant: "outline" }), "h-11 px-5 text-[16px] disabled:pointer-events-none disabled:opacity-40")}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <p className="mt-8 text-p-sm text-foreground/75">
        Breathe in a way that stays comfortable, and stop if you feel lightheaded or short of breath. These timings are
        examples, not a recommendation for everyone. Don&apos;t practice breath holds during hard exercise, in or near water,
        while driving, or anywhere fainting would be dangerous. This is not a treatment for any medical condition.
      </p>
    </div>
  );
}

function BreathShape({
  pattern,
  index,
  progress,
  active,
  showDot,
}: {
  pattern: BreathPattern;
  index: number;
  progress: number;
  active: boolean;
  showDot: boolean;
}) {
  // Segments of the shape, one per phase, as [from, to] points.
  const segments: [number, number][][] =
    pattern.id === "box"
      ? [
          [[40, 200], [40, 40]], // inhale: up the left
          [[40, 40], [200, 40]], // hold: across the top
          [[200, 40], [200, 200]], // exhale: down the right
          [[200, 200], [40, 200]], // hold: back along the bottom
        ]
      : [
          [[20, 190], [96, 50]], // inhale: 4 seconds up
          [[96, 50], [220, 190]], // exhale: 6 seconds down, longer
        ];
  const [[x0, y0], [x1, y1]] = segments[index];
  const dot = [x0 + (x1 - x0) * progress, y0 + (y1 - y0) * progress];
  const labels =
    pattern.id === "box"
      ? [
          { x: 22, y: 124, text: "In", anchor: "end", rotate: -90 },
          { x: 120, y: 26, text: "Hold", anchor: "middle", rotate: 0 },
          { x: 218, y: 124, text: "Out", anchor: "start", rotate: 90 },
          { x: 120, y: 226, text: "Hold", anchor: "middle", rotate: 0 },
        ]
      : [
          { x: 44, y: 104, text: "In · 4", anchor: "middle", rotate: -61 },
          { x: 174, y: 104, text: "Out · 6", anchor: "middle", rotate: 48 },
        ];

  return (
    <svg viewBox="0 0 240 240" aria-hidden className="w-full max-w-[240px] text-foreground">
      {segments.map(([[a, b], [c, d]], i) => (
        <line
          key={i}
          x1={a}
          y1={b}
          x2={c}
          y2={d}
          stroke="currentColor"
          strokeWidth={active && i === index ? 5 : 2}
          strokeOpacity={active && i === index ? 1 : 0.22}
          strokeLinecap="round"
        />
      ))}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor={l.anchor as "end" | "middle" | "start"}
          transform={l.rotate ? `rotate(${l.rotate} ${l.x} ${l.y})` : undefined}
          className="fill-current font-mono text-[14px]"
          fillOpacity={0.65}
          dominantBaseline="middle"
        >
          {l.text}
        </text>
      ))}
      {showDot && <circle data-slot="breath-dot" cx={dot[0]} cy={dot[1]} r={9} className="fill-current" />}
    </svg>
  );
}
