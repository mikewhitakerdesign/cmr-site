import { hillsWithPages, type HillWithPage } from "@/lib/hills";
import { withoutHeldRuns } from "@/lib/permit-hold";
import { getRunsAtHill, runs as allRuns } from "@/lib/runs";
import { describeCadence } from "@/lib/schedule";

export type DirectoryEntry = {
  hill: HillWithPage;
  /** When CMR runs it each week ("Saturdays · 5:30 AM"), one per weekly run. One-off runs aren't listed. */
  cadences: string[];
};

/**
 * Every hill with a page, in display order, with when CMR runs it each week as of `now`.
 * During the permit-pending hold (src/lib/permit-hold.ts) no run is listed, so every hill reads "No set weekly run".
 */
export function directoryEntries(now: Date, runs: Parameters<typeof getRunsAtHill>[2] = withoutHeldRuns(allRuns)): DirectoryEntry[] {
  return hillsWithPages().map((hill) => ({
    hill,
    cadences: getRunsAtHill(hill.slug, now, runs)
      .filter((o) => o.run.schedule.kind === "weekly")
      .map((o) => describeCadence(o.run.schedule)),
  }));
}
