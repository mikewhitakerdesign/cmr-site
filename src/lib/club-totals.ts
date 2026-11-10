import type { ContentStatus } from "@/lib/content-status";

export type ClubTotal = {
  /** As displayed ("132K"); maintained by hand — no Strava integration in v1. */
  value: string;
  /** Small trailing unit ("ft"). */
  unit?: string;
  label: string;
};

/** The playful moon line under the totals (static; no Strava logic). */
export type MoonDistance = {
  /** Where the countdown starts: the average Earth–Moon distance, 238,855 mi. */
  startFt: number;
  /** What's left after the club's vertical so far. */
  remainingFt: number;
};

export type ClubTotals = {
  year: number;
  /** "We're going to the moon!" line; omit to hide it. */
  moon?: MoonDistance;
  /** Date the figures were last counted (YYYY-MM-DD), once real. */
  asOf?: string;
  items: ClubTotal[];
  status: ContentStatus;
};

/**
 * Homepage club totals — Figma "2026 club totals" (1:243), verbatim.
 *
 * PROVISIONAL: these are the approved design's sample figures, not counted
 * club data. They render with a visible "unverified" marker (Owner decision D1)
 * and must be replaced with real totals, or this export set to `null` to hide
 * the section, before launch.
 */
export const clubTotals: ClubTotals | null = {
  year: 2026,
  items: [
    { value: "132K", unit: "ft", label: "Vertical climbed" },
    { value: "2.5K", label: "Total miles" },
    { value: "2", label: "Runners on the hills" },
    { value: "240", label: "Number of runs" },
  ],
  // PR #4 final pass (Owner, 2026-11-09), static: 1,261,154,400 ft (238,855 mi)
  // less the 132K ft "Vertical climbed" above = 1,261,022,400 ft. Update both
  // together if the vertical total changes.
  moon: { startFt: 1_261_154_400, remainingFt: 1_261_022_400 },
  status: "provisional",
};
