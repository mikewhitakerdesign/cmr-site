/**
 * Verification status of a content record (Owner decision D1, 2026-11-07).
 *
 *   placeholder  scaffold filler (e.g. "Example Hill"); never shown on the homepage
 *   provisional  taken from the approved Figma design but not yet confirmed as
 *                fact — shown for design review, always visibly marked
 *   verified     confirmed by the Owner; shown without a marker
 *
 * Before launch every record shown on the site must be `verified`; see the
 * release dependencies in .aiom/work/implement-cmr-homepage.md.
 */
export type ContentStatus = "placeholder" | "provisional" | "verified";

export const isUnverified = (status: ContentStatus) => status !== "verified";
