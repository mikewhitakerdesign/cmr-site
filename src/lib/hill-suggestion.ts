import { isEmail } from "@/lib/validation";

/**
 * Formspree form for the Hills on hills "Know a hill?" suggestion modal (Owner-provided, 2026-11-11:
 * https://formspree.io/f/mjywvydn). A public form ID, not a credential. A different form from the Questions
 * panel (src/lib/questions.ts) and the Join form (src/lib/join.ts); the three share only the
 * `@formspree/react` hook. Recipient, allowed domains and spam settings live in Formspree, not here.
 */
export const HILL_SUGGESTION_FORM_ID = "mjywvydn";

/** Sent as the `form` field so the Owner can tell this form's mail apart in the inbox. */
export const HILL_SUGGESTION_IDENTIFIER = "hill_suggestion";

export const HILL_SUGGESTION_LIMITS = { name: 100, location: 300, notes: 2000, email: 254 } as const;

/** Running surfaces offered in the optional Surface select. */
export const HILL_SURFACES = ["Paved", "Concrete or stairs", "Gravel or crushed limestone", "Dirt or trail", "Grass", "Mixed", "Not sure"] as const;

export type HillSuggestionValues = { location: string; rise: string; email: string };
export type HillSuggestionErrors = Partial<Record<"location" | "rise" | "email", string>>;

/** Client-side checks, mirrored by Formspree's own validation on the server. Only the location is required. */
export function validateHillSuggestion(values: HillSuggestionValues): HillSuggestionErrors {
  const errors: HillSuggestionErrors = {};
  if (!values.location.trim()) errors.location = "Tell us where the hill is: an address, a landmark, a Google Maps link or coordinates.";
  const rise = values.rise.trim();
  if (rise && !(Number.isFinite(Number(rise)) && Number(rise) >= 0)) errors.rise = "Enter the rise in feet as a number, like 40.";
  const email = values.email.trim();
  if (email && !isEmail(email)) errors.email = "That email doesn't look right. Check it, or leave it blank.";
  return errors;
}
