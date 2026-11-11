/**
 * The Participant Waiver and Assumption of Risk: version and the record the Join
 * form sends with a signup. The text lives in src/content/legal.ts; bump
 * WAIVER_VERSION (and that document's version) together whenever the text changes,
 * so each submission names the version its sender saw.
 *
 * DISABLED (Owner direction, 2026-11-10): the waiver is pending attorney review and is not part
 * of the public MVP. With WAIVER_ENABLED false, /participant-waiver returns 404, the footer omits
 * the link, and the Join form has no waiver checkbox and sends no waiver fields (waiverRecord is
 * unused). To bring it back: get the text approved, set the effective date, remove the draft note
 * and `noindex`, set WAIVER_ENABLED true, and restore the Join checkbox (see git history of
 * src/components/join/JoinForm.tsx, commit 0d35c7b) and the Privacy sentence about the record.
 *
 * DRAFT for Owner and Illinois attorney review. The fields below are an
 * acknowledgment record delivered through Formspree. They are not described as a
 * legally sufficient electronic signature, and Formspree is not an immutable audit trail.
 */
/** Public switch for the whole waiver experience. Off: the draft text stays in the repository only. */
export const WAIVER_ENABLED = false;
export const WAIVER_VERSION = "CMR-WAIVER-001";
export const WAIVER_TITLE = "Participant Waiver and Assumption of Risk";
export const WAIVER_PATH = "/participant-waiver";

/** The waiver fields added to a Join submission (Formspree receives them as strings). */
export function waiverRecord(acceptedAt: Date = new Date()): Record<string, string> {
  return {
    waiver_accepted: "true",
    waiver_version: WAIVER_VERSION,
    waiver_accepted_at: acceptedAt.toISOString(),
  };
}
