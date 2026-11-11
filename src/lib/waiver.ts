/**
 * The Participation Waiver and Release of Liability: version and the record the Join form sends with a
 * signup. The text lives in src/content/legal.ts; bump WAIVER_VERSION (and that document's version)
 * together whenever the text changes, so each submission names the version its sender saw.
 *
 * CMR-WAIVER-002 revises CMR-WAIVER-001 and is published (Owner approval, 2026-11-11; not attorney-reviewed).
 * With WAIVER_ENABLED true, /participant-waiver renders, the footer links it and the Join form
 * has a required, unchecked acknowledgment that sends waiver_accepted, waiver_version and
 * waiver_accepted_at through the existing Join Formspree form. To withdraw it, set
 * WAIVER_ENABLED false (the page returns 404, the footer link and the checkbox go).
 *
 * The fields below are an acknowledgment record delivered through Formspree. They are not described as a
 * legally sufficient electronic signature, and Formspree is not an immutable audit trail.
 */
/** Public switch for the whole waiver experience. */
export const WAIVER_ENABLED = true;
export const WAIVER_VERSION = "CMR-WAIVER-002";
export const WAIVER_TITLE = "Participation Waiver and Release of Liability";
export const WAIVER_PATH = "/participant-waiver";

/** The waiver fields added to a Join submission (Formspree receives them as strings). */
export function waiverRecord(acceptedAt: Date = new Date()): Record<string, string> {
  return {
    waiver_accepted: "true",
    waiver_version: WAIVER_VERSION,
    waiver_accepted_at: acceptedAt.toISOString(),
  };
}
