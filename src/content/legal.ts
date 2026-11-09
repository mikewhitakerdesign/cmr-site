/**
 * Legal documents: Website Terms of Use, Privacy Policy and Participation
 * Guidelines. Three separate documents (Owner decision, CMR-JOIN-001).
 *
 * Each entry stays `null` until the Owner-approved text is supplied and every
 * legal/operator field in it is resolved. A `null` document renders an
 * "in review" notice (no policy text, no placeholders presented as policy),
 * is not indexed, and keeps its footer link hidden. To publish one, replace
 * `null` with the approved text; nothing else changes.
 *
 * Do not paraphrase, summarize or extend approved text here, and do not add
 * privacy claims, retention periods, insurance, permit or affiliation
 * statements that the Owner has not approved.
 */
export type LegalSection = { heading: string; paragraphs: string[] };
export type LegalDoc = {
  title: string;
  /** Shown as "Last updated". Use the Owner-approved date. */
  updated: string;
  intro?: string[];
  sections: LegalSection[];
};

export const privacyPolicy: LegalDoc | null = null;
export const websiteTerms: LegalDoc | null = null;
export const participationGuidelines: LegalDoc | null = null;
