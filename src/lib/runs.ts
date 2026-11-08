import type { ContentStatus } from "@/lib/content-status";
import { upcomingOccurrences, type Occurrence, type RunSchedule } from "@/lib/schedule";

export interface Run {
  slug: string;
  title: string;
  hillSlug: string;
  /** Where to meet, as shown ("Cricket Hill · Montrose Beach"). */
  meetupLocation: string;
  description: string;
  /** Short workout label ("Hill repeats"); IA optional V1 field. */
  workoutSummary?: string;
  /** Expected duration ("~60 min"); IA optional V1 field. */
  durationLabel?: string;
  schedule: RunSchedule;
  status: ContentStatus;
}

export type RunOccurrence = Occurrence<Run>;

/**
 * Run records. Nothing here is a confirmed CMR schedule yet.
 *
 * - `example-hill-repeats` is the scaffold placeholder (kept identifiable;
 *   never shown on the homepage).
 * - The two weekly runs follow the Owner's Round 2 direction (2026-11-08):
 *   Cricket Mtn Repeats, Saturday 5:30 AM, ~2 hours; Horner Hell Repeats,
 *   Wednesday 5:30 AM, ~60 minutes. Meeting points are the approved Figma
 *   text. Schiller Quad Killer (a Figma sample) was removed at the same time.
 *   They stay `provisional` until the Owner confirms them: the homepage no
 *   longer shows a sample badge (Owner direction), but the status is kept and
 *   the descriptions say the workout details are still to be confirmed rather
 *   than inventing paces or a structure.
 */
export const runs: Run[] = [
  {
    slug: "example-hill-repeats",
    title: "Example Hill Repeats",
    hillSlug: "example-hill",
    meetupLocation: "Placeholder Park entrance",
    description:
      "Placeholder run. Swap in a real recurring or one-off CMR group run once the schedule is set.",
    schedule: { kind: "once", date: "2026-09-05", time: "06:30" },
    status: "placeholder",
  },
  {
    slug: "cricket-mtn-repeats",
    title: "Cricket Mtn Repeats",
    hillSlug: "cricket-hill",
    meetupLocation: "Cricket Hill · Montrose Beach",
    description:
      "Laps up and down Cricket Hill by the lake, at whatever effort feels right. Do a few reps or stay the whole morning — every pace is welcome and nobody's keeping score. Exact workout to be confirmed.",
    workoutSummary: "Hill repeats",
    durationLabel: "~2 hrs",
    schedule: { kind: "weekly", weekday: "SAT", time: "05:30" },
    status: "provisional",
  },
  {
    slug: "horner-hell-repeats",
    title: "Horner Hell Repeats",
    hillSlug: "horner-hill",
    meetupLocation: "Horner Park",
    description:
      "A shorter midweek session on Horner Park's hill. Climb at your own pace, take the downhills easy, and be done in about an hour. Despite the name, beginners are welcome. Workout details to be confirmed.",
    workoutSummary: "Hill repeats",
    durationLabel: "~60 min",
    schedule: { kind: "weekly", weekday: "WED", time: "05:30" },
    status: "provisional",
  },
];

export function getRun(slug: string): Run | undefined {
  return runs.find((run) => run.slug === slug);
}

/** "Hill Repeats · ~60 min", or whichever part exists. */
export function workoutLabel(run: Pick<Run, "workoutSummary" | "durationLabel">): string | undefined {
  const parts = [run.workoutSummary, run.durationLabel].filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}

/** Runs eligible for public listings: everything except scaffold placeholders. */
export const listedRuns = (all: readonly Run[] = runs) => all.filter((r) => r.status !== "placeholder");

/** Upcoming occurrences (Chicago time) of listed runs, soonest first. */
export function getUpcomingRuns(now: Date, limit?: number, all: readonly Run[] = runs): RunOccurrence[] {
  return upcomingOccurrences(listedRuns(all), now, { limit });
}

/**
 * The next occurrence of each listed run, soonest first — the homepage's
 * "Upcoming runs" list (one row per run, so a cancellation never makes the same
 * run appear twice while hiding another).
 */
export function getNextOccurrencePerRun(now: Date, all: readonly Run[] = runs): RunOccurrence[] {
  const seen = new Set<string>();
  const out: RunOccurrence[] = [];
  const listed = listedRuns(all);
  for (const o of upcomingOccurrences(listed, now)) {
    if (seen.has(o.run.slug)) continue;
    seen.add(o.run.slug);
    out.push(o);
    if (out.length === listed.length) break;
  }
  return out;
}
