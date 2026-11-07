import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Newsletter signup — Figma "Footer / Newsletter and legal" heading + copy +
 * "NewsletterForm" (MWDS Input "Email address" + MWDS Button "Join the list",
 * linked library instances in all 20 CMR placements).
 *
 * Mechanism (Owner decision 2026-11-07, clarifying the 2026-08-20 embed
 * decision): a native HTML form whose `action` is the newsletter provider's
 * hosted endpoint. The browser posts the address straight to the provider;
 * no CMR server code receives or stores it. Until a provider endpoint is
 * configured the form renders disabled with a status note — it never posts
 * to a placeholder.
 *
 * Configure with props or env:
 *   NEXT_PUBLIC_NEWSLETTER_FORM_ACTION  https URL of the provider form endpoint
 *   NEXT_PUBLIC_NEWSLETTER_EMAIL_FIELD  provider's email field name (default "email";
 *                                       e.g. Mailchimp "EMAIL", Kit "email_address")
 */
export type NewsletterSignupProps = {
  heading?: ReactNode;
  description?: ReactNode;
  /** Heading level for the document outline. Defaults to h2. */
  headingLevel?: "h2" | "h3";
  /** Provider form endpoint (https). Falls back to NEXT_PUBLIC_NEWSLETTER_FORM_ACTION. */
  action?: string;
  /** Name of the email field the provider expects. */
  emailFieldName?: string;
  /** Extra provider fields (list IDs, honeypots) sent as hidden inputs. */
  hiddenFields?: Record<string, string>;
  /** Where the provider's confirmation page opens. */
  target?: "_self" | "_blank";
  placeholder?: string;
  submitLabel?: string;
  /** Shown while no provider endpoint is configured. */
  unavailableMessage?: string;
  className?: string;
};

/** Returns the endpoint only if it is an absolute https URL; anything else counts as unconfigured. */
export function resolveFormAction(action: string | undefined): string | null {
  if (!action) return null;
  try {
    const url = new URL(action);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export const defaultNewsletterHeading = "Get the next run in your inbox.";
export const defaultNewsletterDescription = (
  <>
    Run announcements, hill workouts and occasional dispatches from Chicago&apos;s highest{" "}
    <s>hills</s> mountains.
  </>
);

export default function NewsletterSignup({
  heading = defaultNewsletterHeading,
  description = defaultNewsletterDescription,
  headingLevel: Heading = "h2",
  action = process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ACTION,
  emailFieldName = process.env.NEXT_PUBLIC_NEWSLETTER_EMAIL_FIELD || "email",
  hiddenFields,
  target = "_self",
  placeholder = "you@email.com",
  submitLabel = "Join the list",
  unavailableMessage = "Newsletter signup isn’t open yet.",
  className,
}: NewsletterSignupProps) {
  const id = useId();
  const headingId = `${id}-heading`;
  const inputId = `${id}-email`;
  const statusId = `${id}-status`;
  const endpoint = resolveFormAction(action);
  const enabled = endpoint !== null;

  return (
    <section aria-labelledby={headingId} className={className}>
      <Heading
        id={headingId}
        className={cn(
          // Geist Black + ss08 per Figma (off the MWDS heading weights).
          "font-black [font-feature-settings:'ss08'_1]",
          "text-[28px] leading-8 tracking-[-1px]",
          "md:text-h2 md:leading-8 lg:leading-(--text-h2--line-height)",
        )}
      >
        {heading}
      </Heading>
      <p className="mt-[14px] text-p lg:mt-3 lg:text-p-lg">{description}</p>

      <form
        action={endpoint ?? undefined}
        method="post"
        target={target}
        aria-describedby={enabled ? undefined : statusId}
        className="mt-6 flex gap-(--space-xs) lg:mt-8 lg:max-w-[448px]"
      >
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <Input
          id={inputId}
          name={emailFieldName}
          type="email"
          required
          autoComplete="email"
          spellCheck={false}
          placeholder={placeholder}
          disabled={!enabled}
          className="h-12 flex-1 lg:h-11"
        />
        {enabled &&
          Object.entries(hiddenFields ?? {}).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        {/* Figma resizes the MWDS Extra Large instance to 131px, narrower than
            label + XL padding (32px); the MWDS `lg` padding token reproduces
            the approved composition and still grows for longer labels. */}
        <Button
          type="submit"
          size="xl"
          disabled={!enabled}
          className="h-12 min-w-[131px] px-(--space-lg) lg:h-11"
        >
          {submitLabel}
        </Button>
      </form>
      {!enabled && (
        <p id={statusId} role="status" className="mt-2 text-p-sm">
          {unavailableMessage}
        </p>
      )}
    </section>
  );
}
