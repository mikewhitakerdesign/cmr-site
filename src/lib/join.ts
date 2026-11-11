import { isEmail } from "@/lib/validation";

/**
 * Formspree form for the Join page (Owner-provided, 2026-11-08:
 * https://formspree.io/f/xrppvnln). A public form ID, not a credential:
 * Formspree identifies the form by it and forwards submissions to the inbox
 * configured in the Owner's Formspree account. No recipient address or account
 * token belongs in this repository.
 *
 * This is a different form from the floating Questions panel
 * (src/lib/questions.ts). The two integrations share no code path except the
 * `@formspree/react` hook and must stay separate.
 *
 * Configuration that lives in Formspree, not here (see the Work Item):
 * recipient, allowed domains, spam settings (reCAPTCHA must stay off for AJAX
 * submissions unless a custom key is set), plan limits and retention.
 */
export const JOIN_FORM_ID = "xrppvnln";

/** Field limits, mirrored by `maxLength` on the inputs. */
export const JOIN_LIMITS = { firstName: 60, email: 254 } as const;

export type JoinValues = { firstName: string; email: string; waiver: boolean };
export type JoinErrors = Partial<Record<"firstName" | "email" | "waiver", string>>;

/** Client-side checks, mirrored by Formspree's own validation on the server. */
export function validateJoin(values: JoinValues): JoinErrors {
  const errors: JoinErrors = {};
  if (!values.firstName.trim()) errors.firstName = "Add your first name.";
  if (!values.email.trim()) errors.email = "Add your email address so we can send club updates.";
  else if (!isEmail(values.email)) errors.email = "That email doesn't look right. Check it and try again.";
  if (!values.waiver) errors.waiver = "Read and agree to the Participation Waiver and Release of Liability to join.";
  return errors;
}
