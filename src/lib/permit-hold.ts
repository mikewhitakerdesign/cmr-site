/**
 * Permit-pending hold on official organized group runs.
 *
 * CMR has not been cleared to hold organized group runs in Chicago parks. Park
 * District permitting is still under review, so the site must not present any
 * run as available, scheduled or approved. This module is the ONE switch.
 *
 * To lift the hold (Owner authorization required, see
 * .aiom/work/implement-cmr-join-page.md): set OFFICIAL_RUNS_ON_HOLD to false.
 * Nothing else needs to change; every place that shows a run, a run date, a run
 * detail page or a calendar download reads this flag. Held content is hidden
 * rather than deleted, so the Find a Run experience returns exactly as built.
 *
 * What the hold covers (and `tests/lib/permit-hold-coverage.test.ts` enforces):
 *   - /calendar shows the hold notice instead of the calendar
 *   - /calendar/[slug] and /calendar/[slug]/ics are unavailable
 *   - the homepage shows no run, date or "run details" link
 *   - hill pages and the hills directory show no scheduled run
 * The Chicago Hills directory and hill pages themselves stay open.
 *
 * Wording note: the copy below says only that CMR is reviewing park-use
 * requirements and that official meetups are on hold. It does not say a permit
 * was applied for, approved or denied, and it names no agency.
 */
export const OFFICIAL_RUNS_ON_HOLD = true;

export const PERMIT_HOLD_COPY = {
  heading: "THE HILLS AREN'T GOING ANYWHERE.",
  body: "We're reviewing park-use requirements before launching our organized group runs. Official meetups are on hold for now.",
  supporting: "In the meantime, explore Chicago's hills and join the club for updates.",
  /** Short forms for places where the full notice would be too heavy (home, hill pages, directory). */
  short: "Official group runs are on hold while we review park-use requirements.",
  /** Run-section heading on hill pages and the homepage. */
  sectionHeading: "Group runs are on hold.",
} as const;

/** True when official runs may be shown. */
export const officialRunsAvailable = (held: boolean = OFFICIAL_RUNS_ON_HOLD): boolean => !held;

/**
 * Pass a list of runs, occurrences or rows through the hold: unchanged when the
 * hold is off, empty when it is on. `held` exists so tests can exercise both states.
 */
export function withoutHeldRuns<T>(items: readonly T[], held: boolean = OFFICIAL_RUNS_ON_HOLD): readonly T[] {
  return held ? [] : items;
}
