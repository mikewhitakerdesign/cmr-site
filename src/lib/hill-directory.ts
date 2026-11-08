import { hillsWithPages, type HillWithPage } from "@/lib/hills";
import { getRunsAtHill } from "@/lib/runs";
import { describeCadence } from "@/lib/schedule";

export type DirectoryEntry = {
  hill: HillWithPage;
  /** Place in the full list (01–05), kept when a page shows a subset. */
  number: number;
  /** When CMR runs it ("Saturdays · 5:30 AM"), one per upcoming run. */
  cadences: string[];
};

/** Every hill with a page, numbered in display order, with when CMR runs it as of `now`. */
export function directoryEntries(now: Date): DirectoryEntry[] {
  return hillsWithPages().map((hill, i) => ({
    hill,
    number: i + 1,
    cadences: getRunsAtHill(hill.slug, now).map((o) => describeCadence(o.run.schedule)),
  }));
}
