"use client";

import { useForm } from "@formspree/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { CtaLink } from "@/components/CtaLink";
import { Field } from "@/components/form/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FLUID_TYPE } from "@/lib/fluid";
import { DISPLAY_HEADING, standardH2 } from "@/lib/headings";
import { JOIN_FORM_ID, JOIN_LIMITS, validateJoin, type JoinErrors } from "@/lib/join";
import { OFFICIAL_RUNS_ON_HOLD } from "@/lib/permit-hold";
import { cn } from "@/lib/utils";
import { WAIVER_PATH, WAIVER_TITLE, waiverRecord } from "@/lib/waiver";

/**
 * The Join form (Owner-approved flow, 2026-11-09; waiver checkbox 2026-11-10): first name,
 * email address and one required, unchecked-by-default checkbox that confirms the person is
 * 18 or older and agrees to the Participant Waiver (linked, not required reading).
 *
 * Delivery: Formspree (form `xrppvnln`) through `@formspree/react` `useForm`. The
 * browser posts straight to Formspree; nothing is stored by this app, there is no
 * CMR API, database or account, and no recipient address lives in the repository.
 * Membership is a manually kept private roster (Owner decision), and there is no
 * automated welcome email. The success message is the website's own confirmation.
 *
 * The submission carries the acknowledgment record (src/lib/waiver.ts): waiver_accepted,
 * waiver_version and an ISO 8601 waiver_accepted_at, stamped when the form is sent, plus
 * age_18_plus (the same checkbox). It is a record in Formspree, not a claim of a legally
 * sufficient e-signature. The waiver is a draft pending attorney review. Unsubscribing is manual: the disclosure points to the
 * Questions form rather than promising an unsubscribe link that does not exist.
 *
 * Behavior:
 *   - validation: all three fields required; email format checked before sending;
 *     errors are linked to their fields and the first invalid field is focused;
 *     Formspree's field and form errors are shown the same way
 *   - sending: the button is disabled and says "Joining…"; a synchronous lock also
 *     blocks a second submit before React re-renders
 *   - errors: whatever was typed (and the checkbox) stays; the form says plainly
 *     that nothing was received and can be submitted again
 *   - success: only after Formspree confirms; the form is replaced in place by the
 *     confirmation, which is announced and focused. It does not repeat the email.
 */
export function JoinForm() {
  const uid = useId();
  const ids = {
    firstName: `${uid}-first-name`,
    email: `${uid}-email`,
    waiver: `${uid}-waiver`,
    formError: `${uid}-form-error`,
  };
  const [errors, setErrors] = useState<JoinErrors>({});
  const [state, submit] = useForm<Record<string, string>>(JOIN_FORM_ID);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const waiverRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const sending = useRef(false);
  // The button stays disabled until both fields look valid and the box is checked. Submission is
  // still validated in onSubmit, so the disabled state is never the only guard.
  const [ready, setReady] = useState(false);
  const checkReady = (form: HTMLFormElement) => {
    const d = new FormData(form);
    const found = validateJoin({ firstName: String(d.get("first_name") ?? ""), email: String(d.get("email") ?? ""), waiver: d.get("waiver_accepted") === "true" });
    setReady(Object.keys(found).length === 0);
  };

  useEffect(() => {
    // The form is replaced by the confirmation, so the checked box never carries over to another signup.
    if (state.succeeded) doneRef.current?.focus();
  }, [state.succeeded]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending.current) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const found = validateJoin({
      firstName: String(data.get("first_name") ?? ""),
      email: String(data.get("email") ?? ""),
      waiver: data.get("waiver_accepted") === "true",
    });
    setErrors(found);
    if (found.firstName) return firstNameRef.current?.focus();
    if (found.email) return emailRef.current?.focus();
    if (found.waiver) return waiverRef.current?.focus();
    sending.current = true;
    try {
      // Stamped now, at the moment of sending. age_18_plus is the same checkbox, kept for the roster.
      data.set("age_18_plus", "yes");
      for (const [k, v] of Object.entries(waiverRecord())) data.set(k, v);
      await submit(data);
    } finally {
      sending.current = false;
    }
  };

  // Formspree's own field errors (server-side validation), shown like ours.
  const serverField = (f: string) => state.errors?.getFieldErrors(f).map((x) => x.message).join(" ") || undefined;
  const fieldError = {
    firstName: errors.firstName ?? serverField("first_name"),
    email: errors.email ?? serverField("email"),
    waiver: errors.waiver ?? serverField("waiver_accepted"),
  };
  // Any delivery failure shows the Owner's recoverable-error copy; Formspree's wording is not shown.
  const formError = state.errors?.getFormErrors().length ? "We couldn't confirm your signup. Please try again. Your information is still here." : undefined;

  if (state.succeeded) {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        data-slot="join-success"
        className="rounded-xl bg-accent p-6 text-accent-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring md:p-10"
      >
        <h2 style={standardH2()} className={cn(FLUID_TYPE, DISPLAY_HEADING)}>
          YOU&apos;RE IN.
        </h2>
        <p className="mt-5 max-w-[48ch] text-[20px] leading-[30px]">
          We&apos;ve received your signup. You&apos;ll hear from us when there&apos;s something worth sharing.
        </p>
        <p className="mt-3 max-w-[48ch] text-[18px] leading-[27px]">In the meantime, there&apos;s a hill with your name on it.</p>
        {/* While official meetups are on hold, send people to the Hills directory, never to an unavailable event. */}
        <CtaLink
          href={OFFICIAL_RUNS_ON_HOLD ? "/hills" : "/calendar"}
          variant="primary"
          className="mt-8 h-14 px-7 text-[18px] leading-[27px] font-medium"
        >
          {OFFICIAL_RUNS_ON_HOLD ? "Explore the hills" : "Find a Run"}
        </CtaLink>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} onChange={(e) => checkReady(e.currentTarget)} aria-describedby={formError ? ids.formError : undefined} className="flex flex-col gap-6">
      <Field id={ids.firstName} label="First name" error={fieldError.firstName}>
        <Input
          ref={firstNameRef}
          id={ids.firstName}
          name="first_name"
          required
          autoComplete="given-name"
          maxLength={JOIN_LIMITS.firstName}
          aria-required="true"
          aria-invalid={fieldError.firstName ? true : undefined}
          aria-describedby={fieldError.firstName ? `${ids.firstName}-error` : undefined}
          className="h-12"
        />
      </Field>
      <Field id={ids.email} label="Email address" error={fieldError.email}>
        <Input
          ref={emailRef}
          id={ids.email}
          name="email"
          type="email"
          required
          autoComplete="email"
          spellCheck={false}
          maxLength={JOIN_LIMITS.email}
          aria-required="true"
          aria-invalid={fieldError.email ? true : undefined}
          aria-describedby={fieldError.email ? `${ids.email}-error` : undefined}
          className="h-12"
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        {/* The link sits inside the label so the sentence reads as one; clicking it opens the page and never toggles the box. */}
        <label htmlFor={ids.waiver} className="flex cursor-pointer items-start gap-3 text-p">
          <input
            ref={waiverRef}
            id={ids.waiver}
            name="waiver_accepted"
            type="checkbox"
            value="true"
            required
            aria-required="true"
            aria-invalid={fieldError.waiver ? true : undefined}
            aria-describedby={fieldError.waiver ? `${ids.waiver}-error` : undefined}
            className={cn(
              "mt-0.5 size-6 shrink-0 cursor-pointer rounded-sm accent-primary outline-none",
              "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "aria-invalid:outline-2 aria-invalid:outline-destructive-border",
            )}
          />
          <span>
            I confirm that I am 18 or older, have read the{" "}
            <Link
              href={WAIVER_PATH}
              target="_blank"
              className="rounded-xs font-medium underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring"
            >
              {WAIVER_TITLE}
            </Link>
            , understand the risks of participating in Chicago Mountain Runners activities, and agree to its terms.
          </span>
        </label>
        {fieldError.waiver && (
          <p id={`${ids.waiver}-error`} className="text-p-mini font-medium text-destructive">
            {fieldError.waiver}
          </p>
        )}
      </div>

      {/* Formspree honeypot: bots fill it, people never see it. */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {/* Lets the Owner tell Join mail from Questions mail in the Formspree inbox. */}
      <input type="hidden" name="_subject" value="CMR Join signup" />

      <p className="max-w-[56ch] text-p-sm text-muted-foreground">
        Joining is free and includes emails about club runs, schedule changes, and occasional community news. You can
        unsubscribe at any time by contacting us through the Questions form. Read our{" "}
        <Link href="/privacy" className="rounded-xs underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring">
          Privacy Policy
        </Link>{" "}
        to learn how we handle your information.
      </p>

      {formError && (
        <p id={ids.formError} role="alert" className="rounded-lg border border-destructive-border p-3 text-p-sm">
          We didn&apos;t receive your signup. {formError} Nothing has been lost; check your connection and try again.
        </p>
      )}

      <div className="flex flex-col gap-2 self-start">
        <Button
          type="submit"
          size="xl"
          disabled={state.submitting || !ready}
          aria-disabled={state.submitting || !ready || undefined}
          aria-describedby={!ready ? `${uid}-hint` : undefined}
        >
          {state.submitting ? "Joining…" : "Count me in"}
        </Button>
        {!ready && (
          <p id={`${uid}-hint`} className="text-p-mini text-muted-foreground">
            Add your name and email and check the box to continue.
          </p>
        )}
      </div>
    </form>
  );
}
