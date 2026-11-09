import type { ContentStatus } from "@/lib/content-status";
import {
  addDays,
  occurrencesWithStatus,
  toClubTime,
  upcomingOccurrences,
  type Occurrence,
  type RunSchedule,
  type StatusOccurrence,
} from "@/lib/schedule";

/** The detail-page copy for a run. Paragraph arrays render one `<p>` each. */
export interface RunContent {
  headline: string;
  intro: string[];
  workout: string;
  effort: string;
  terrain: string;
  bring: string;
  firstTime: string;
  /** Short place name for the Where to meet block. */
  placeName: string;
}

export interface Run {
  slug: string;
  title: string;
  hillSlug: string;
  /** Where to meet, as shown ("Cricket Hill · Montrose Beach"). */
  meetupLocation: string;
  description: string;
  /** One or two concise sentences for the Find a Run lists (from the Owner-approved run copy). */
  summary?: string;
  /** Short workout label ("Hill repeats"); IA optional V1 field. */
  workoutSummary?: string;
  /** Expected duration ("~60 min"); IA optional V1 field. */
  durationLabel?: string;
  /** Approximate length in minutes, for calendar exports. */
  durationMinutes?: number;
  /** Detail-page copy (Owner-approved, Find a Run milestone). */
  content?: RunContent;
  /** Where the "Get directions" link goes: the Owner's Google Maps link for the meeting place. */
  directionsUrl?: string;
  schedule: RunSchedule;
  status: ContentStatus;
}

export type RunOccurrence = Occurrence<Run>;

/**
 * Run records. Nothing here is a confirmed CMR schedule yet.
 *
 * - `example-hill-repeats` is the scaffold placeholder (kept identifiable;
 *   never shown on the homepage).
 * - The two weekly runs' detail copy and map links are Owner-approved text (Find a
 *   Run milestone, 2026-11-09); their schedule facts are still provisional, below.
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
      "Laps up and down Cricket Hill by the lake, at whatever effort feels right. Do a few reps or stay the whole morning. Every pace is welcome and nobody's keeping score. Exact workout to be confirmed.",
    summary:
      "Repeated climbs on Cricket Hill, with downhill recovery between efforts. Run it at your own effort and stay for a few laps or the whole session.",
    workoutSummary: "Hill repeats",
    durationLabel: "~2 hrs",
    durationMinutes: 120,
    directionsUrl: "https://maps.app.goo.gl/11S9yixBqMH3vxC97",
    content: {
      headline: "A little mountain by the lake.",
      intro: [
        "Saturday mornings at 5:30. Two hours of running up and down a hill that Chicago was kind enough to provide.",
        "Run the climbs at your own effort, recover on the descents, and repeat. Stay for a few laps or stick around for the entire session. Nobody's counting but you.",
      ],
      workout:
        "Repeated climbs on Cricket Hill, with downhill recovery between efforts. Find a rhythm that works for you. Run, jog, hike, or mix it up.",
      effort:
        "Self-directed. There is no required pace, and completing every repeat isn't the point. High-fives in passing encouraged (optional after 150 repeats).",
      terrain: "Grass and paved areas around Cricket Hill. Specific repeat routes and conditions may vary.",
      bring:
        "Running shoes (trail preferable, but road shoes work), water and fueling as you require, and whatever you normally need for an early-morning workout. A headlamp is encouraged for the early start when it's dark.",
      firstTime:
        "Good. Everyone had a first hill repeat. No registration, no required pace, and no obligation to stay for the entire workout. Come climb a few hills with us.",
      placeName: "Cricket Hill",
    },
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
    summary:
      "A short, focused hill session at Horner Park. Climb at your own effort, recover on the way down, and repeat. Despite the name, beginners are welcome.",
    workoutSummary: "Hill repeats",
    durationLabel: "~60 min",
    durationMinutes: 60,
    directionsUrl: "https://maps.app.goo.gl/UkzLSDPRzYykq9Aq6",
    content: {
      headline: "An hour of questionable decisions.",
      intro: [
        "Wednesday mornings at 5:30. A short, focused hill session at Horner Park.",
        "Climb at your own effort, take the descents easy or bomb 'em, and then repeat. It's a straightforward way to get some elevation into the middle of your week.",
        "Despite the name, beginners are welcome.",
      ],
      workout:
        "Repeated climbs on Horner Park's hill, with recovery between efforts. The exact session can vary, but the objective remains the same: get uphill, recover, and do it again.",
      effort: "Entirely your own. Run, jog, or hike the climbs at a pace that works for you.",
      terrain: "Park paths and grassy slopes. Surface conditions may change with the weather.",
      bring: "Running shoes, water, and a light for darker mornings.",
      firstTime: "No problem. You don't have to be fast, and you don't have to finish every repeat. The hill isn't going anywhere.",
      placeName: "Horner Park",
    },
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

/**
 * The next occurrence of each listed run held at `hillSlug`, soonest first —
 * the Hill → Run side of the bidirectional relationship (IA). Runs with no
 * upcoming occurrence (ended, cancelled) drop out.
 */
export function getRunsAtHill(hillSlug: string, now: Date, all: readonly Run[] = runs): RunOccurrence[] {
  return getNextOccurrencePerRun(now, all).filter((o) => o.run.hillSlug === hillSlug);
}

/** One run's next occurrence including a cancelled one, with its following real occurrence if cancelled. */
export function nextWithStatus(
  run: Run,
  now: Date,
  horizonDays = 120,
): { occurrence: StatusOccurrence<Run>; following: RunOccurrence | null } | null {
  const today = toClubTime(now).date;
  const future = occurrencesWithStatus(run, today, addDays(today, horizonDays)).filter((o) => o.startsAt.getTime() >= now.getTime());
  const first = future[0];
  if (!first) return null;
  return { occurrence: first, following: first.status === "cancelled" ? (future.find((o) => o.status !== "cancelled") ?? null) : null };
}

/**
 * The next occurrence of each listed run including cancelled ones, soonest
 * first, each with the run's following real occurrence. The /calendar
 * "Upcoming runs" list uses it so a cancellation stays visible instead of
 * quietly disappearing (the homepage keeps `getNextOccurrencePerRun`).
 */
export function getUpcomingWithStatus(
  now: Date,
  all: readonly Run[] = runs,
  horizonDays = 120,
): { occurrence: StatusOccurrence<Run>; following: RunOccurrence | null }[] {
  return listedRuns(all)
    .flatMap((run) => nextWithStatus(run, now, horizonDays) ?? [])
    .sort(
      (a, b) =>
        a.occurrence.startsAt.getTime() - b.occurrence.startsAt.getTime() ||
        a.occurrence.run.title.localeCompare(b.occurrence.run.title),
    );
}
