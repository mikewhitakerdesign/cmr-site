/**
 * The Participant Waiver and Assumption of Risk: version and the record the Join
 * form sends with a signup. The text lives in src/content/legal.ts; bump
 * WAIVER_VERSION (and that document's version) together whenever the text changes,
 * so each submission names the version its sender saw.
 *
 * DRAFT for Owner and Illinois attorney review. The fields below are an
 * acknowledgment record delivered through Formspree. They are not described as a
 * legally sufficient electronic signature, and Formspree is not an immutable audit trail.
 */
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
