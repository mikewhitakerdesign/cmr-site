import type { ContentStatus } from "@/lib/content-status";

export type ClubTotal = {
  /** As displayed ("132K"); maintained by hand — no Strava integration in v1. */
  value: string;
  /** Small trailing unit ("ft"). */
  unit?: string;
  label: string;
};

export type ClubTotals = {
  year: number;
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
  status: "provisional",
};
