/**
 * Pure logic for The Science page (/the-science): the section list the sticky
 * subsection navigation reads, the incline geometry, the elevation
 * accumulator's arithmetic and validation, and the breathing-pattern timeline.
 * No React and no DOM, so every number on the page can be unit-tested.
 */

/** The page's major sections, in page order. The hero has no anchor. */
export const SCIENCE_SECTIONS = [
  { id: "physics", label: "Physics" },
  { id: "physiology", label: "Physiology" },
  { id: "training", label: "Training" },
  { id: "breathing", label: "Breathing" },
  { id: "the-mind", label: "The Mind" },
  { id: "descending", label: "Descending" },
  { id: "workouts", label: "Workouts" },
  { id: "sources", label: "Sources" },
] as const;

export type ScienceSectionId = (typeof SCIENCE_SECTIONS)[number]["id"];

/** "02" for the first section: the hero is 01 in the editorial numbering. */
export function sectionNumber(id: ScienceSectionId): string {
  const i = SCIENCE_SECTIONS.findIndex((s) => s.id === id);
  return String(i + 2).padStart(2, "0");
}

/* ------------------------------------------------------------------ */
/* Incline geometry (Physics). Geometry only: no physiology is implied. */
/* ------------------------------------------------------------------ */

export const GRADE_RANGE = { min: 0, max: 45, step: 1, initial: 10 } as const;

export type InclineGeometry = {
  /** Grade in percent: rise ÷ run × 100. */
  gradePct: number;
  /** Horizontal distance, in the caller's unit. */
  run: number;
  /** Vertical rise over that run. */
  rise: number;
  /** Incline angle in degrees: arctan(rise ÷ run). */
  angleDeg: number;
  /** Length along the sloped surface: √(run² + rise²). */
  slopeLength: number;
};

export function inclineGeometry(gradePct: number, run = 100): InclineGeometry {
  const g = Math.max(0, gradePct);
  const rise = (run * g) / 100;
  return {
    gradePct: g,
    run,
    rise,
    angleDeg: (Math.atan(g / 100) * 180) / Math.PI,
    slopeLength: Math.hypot(run, rise),
  };
}

/* ------------------------------------------------------------------ */
/* Elevation accumulator (Training).                                  */
/* ------------------------------------------------------------------ */

export const ACCUMULATOR = {
  gain: { min: 1, max: 1000, initial: 40, label: "Elevation gain per climb", unit: "feet" },
  repeats: { min: 1, max: 200, initial: 25, label: "Completed repeats", unit: "repeats" },
} as const;

export const FEET_TO_METERS = 0.3048;

export type ParsedWhole = { ok: true; value: number } | { ok: false; error: string };

const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * A whole number typed into a text field, within [min, max]. Thousands
 * separators and surrounding spaces are accepted; decimals, signs and
 * anything else are not.
 */
export function parseWhole(raw: string, { min, max }: { min: number; max: number }): ParsedWhole {
  const s = raw.trim().replace(/,/g, "");
  const range = `Enter a whole number from ${fmt(min)} to ${fmt(max)}.`;
  if (s === "") return { ok: false, error: range };
  if (!/^\d+$/.test(s)) return { ok: false, error: range };
  const value = Number(s);
  if (!Number.isSafeInteger(value) || value < min || value > max) return { ok: false, error: range };
  return { ok: true, value };
}

/** Total accumulated gain: gain per climb × completed repeats. */
export function accumulatedGain(gainPerClimbFt: number, repeats: number): number {
  return gainPerClimbFt * repeats;
}

export function formatFeet(ft: number): string {
  return `${fmt(ft)} ft`;
}

export function formatMeters(ft: number): string {
  return `${fmt(Math.round(ft * FEET_TO_METERS))} m`;
}

/* ------------------------------------------------------------------ */
/* Breathing patterns (Breathing).                                    */
/* ------------------------------------------------------------------ */

export type BreathPhaseKind = "inhale" | "hold-in" | "exhale" | "hold-out";
export type BreathPhase = { kind: BreathPhaseKind; label: string; seconds: number };
export type BreathPattern = { id: "box" | "extended-exhale"; name: string; summary: string; phases: BreathPhase[] };

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: "box",
    name: "Box breathing",
    summary: "Inhale 4 seconds, hold 4, exhale 4, hold 4.",
    phases: [
      { kind: "inhale", label: "Inhale", seconds: 4 },
      { kind: "hold-in", label: "Hold", seconds: 4 },
      { kind: "exhale", label: "Exhale", seconds: 4 },
      { kind: "hold-out", label: "Hold", seconds: 4 },
    ],
  },
  {
    id: "extended-exhale",
    name: "Extended exhale",
    summary: "Inhale 4 seconds, exhale 6.",
    phases: [
      { kind: "inhale", label: "Inhale", seconds: 4 },
      { kind: "exhale", label: "Exhale", seconds: 6 },
    ],
  },
];

export function cycleSeconds(p: BreathPattern): number {
  return p.phases.reduce((s, ph) => s + ph.seconds, 0);
}

export type BreathPosition = {
  /** Index into `pattern.phases`. */
  index: number;
  phase: BreathPhase;
  /** 0…1 through the current phase. */
  progress: number;
  /** Whole seconds left in the phase, counting down to 1 (never 0). */
  remaining: number;
  /** Completed cycles. */
  cycle: number;
  /** 0…1 through the whole cycle. */
  cycleProgress: number;
};

/** Where in the pattern `elapsedMs` of practice falls. Negative time reads as the start. */
export function breathAt(pattern: BreathPattern, elapsedMs: number): BreathPosition {
  const total = cycleSeconds(pattern) * 1000;
  const t = Math.max(0, elapsedMs);
  const cycle = Math.floor(t / total);
  let within = t - cycle * total;
  const cycleProgress = within / total;
  for (let index = 0; index < pattern.phases.length; index++) {
    const phase = pattern.phases[index];
    const len = phase.seconds * 1000;
    if (within < len) {
      return {
        index,
        phase,
        progress: within / len,
        remaining: Math.max(1, Math.ceil((len - within) / 1000)),
        cycle,
        cycleProgress,
      };
    }
    within -= len;
  }
  /* Unreachable for a pattern with positive phase lengths; keeps the type total. */
  const last = pattern.phases.length - 1;
  return { index: last, phase: pattern.phases[last], progress: 1, remaining: 1, cycle, cycleProgress: 1 };
}
