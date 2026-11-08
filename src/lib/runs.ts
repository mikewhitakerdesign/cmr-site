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
 * - The three weekly runs are the sample schedule drawn in the approved Figma
 *   homepage (Upcoming runs 1:24 and the Next run card 1:407): names, weekday,
 *   time, meeting point, workout and duration are Figma's text, verbatim. They
 *   are `provisional` and render with a visible "sample" marker until the
 *   Owner confirms them. Descriptions say so rather than inventing detail.
 */
const PROVISIONAL_DESCRIPTION =
  "Sample run from the approved homepage design. The schedule, meeting point and workout are not confirmed yet.";

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
    description: PROVISIONAL_DESCRIPTION,
    workoutSummary: "Hill Repeats",
    durationLabel: "~60 min",
    schedule: { kind: "weekly", weekday: "TUE", time: "05:30" },
    status: "provisional",
  },
  {
    slug: "horner-hell-repeats",
    title: "Horner Hell Repeats",
    hillSlug: "horner-hill",
    meetupLocation: "Horner Park",
    description: PROVISIONAL_DESCRIPTION,
    workoutSummary: "Hill repeats",
    durationLabel: "~60 min",
    schedule: { kind: "weekly", weekday: "FRI", time: "05:30" },
    status: "provisional",
  },
  {
    slug: "schiller-quad-killer",
    title: "Schiller Quad Killer",
    hillSlug: "schiller-hill",
    meetupLocation: "Schiller Woods",
    description: PROVISIONAL_DESCRIPTION,
    workoutSummary: "XC miles + Hill repeats",
    durationLabel: "~3 hrs",
    schedule: { kind: "weekly", weekday: "SAT", time: "05:00" },
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
