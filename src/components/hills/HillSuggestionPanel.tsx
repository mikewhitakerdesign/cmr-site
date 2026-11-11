"use client";

import { useForm } from "@formspree/react";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Field } from "@/components/form/Field";
import { textareaClass } from "@/components/QuestionsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HILL_SUGGESTION_FORM_ID,
  HILL_SUGGESTION_IDENTIFIER,
  HILL_SUGGESTION_LIMITS as LIMITS,
  HILL_SURFACES,
  validateHillSuggestion,
  type HillSuggestionErrors,
} from "@/lib/hill-suggestion";
import { cn } from "@/lib/utils";

export const hillSuggestionIds = (idBase: string) => ({ title: `${idBase}-title`, intro: `${idBase}-intro` });

/**
 * The "Know a hill?" form and its states (heading, intro, fields, validation, sending, success, error), in the
 * shared ModalDialog. It follows QuestionsPanel: Formspree through `@formspree/react` `useForm`, a client check
 * before sending, a synchronous send lock, focus moved in the commit that swaps the form for the success
 * message, a honeypot, and a draft that survives closing. Only the location is required. Nothing is geocoded
 * or sent anywhere but Formspree.
 */
export function HillSuggestionPanel({ idBase, open, onClose }: { idBase: string; open: boolean; onClose: () => void }) {
  const ids = {
    ...hillSuggestionIds(idBase),
    name: `${idBase}-name`,
    location: `${idBase}-location`,
    rise: `${idBase}-rise`,
    surface: `${idBase}-surface`,
    notes: `${idBase}-notes`,
    email: `${idBase}-email`,
    formError: `${idBase}-form-error`,
  };
  const [errors, setErrors] = useState<HillSuggestionErrors>({});
  const [state, submit] = useForm<Record<string, string>>(HILL_SUGGESTION_FORM_ID);
  const nameRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const riseRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);
  const sending = useRef(false);

  const focusCurrent = () => {
    if (open) (state.succeeded ? doneRef : nameRef).current?.focus();
  };
  // As in QuestionsPanel: the success message replaces the focused button, so move focus in the same commit
  // (never leave it on <body>, where Escape does nothing); opening focus waits for the dialog to open.
  useLayoutEffect(focusCurrent, [open, state.succeeded]);
  useEffect(focusCurrent, [open, state.succeeded]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending.current) return;
    const data = new FormData(e.currentTarget);
    const found = validateHillSuggestion({
      location: String(data.get("location") ?? ""),
      rise: String(data.get("rise_ft") ?? ""),
      email: String(data.get("email") ?? ""),
    });
    setErrors(found);
    if (found.location) return locationRef.current?.focus();
    if (found.rise) return riseRef.current?.focus();
    if (found.email) return emailRef.current?.focus();
    sending.current = true;
    try {
      await submit(data);
    } finally {
      sending.current = false;
    }
  };

  // Formspree's own field errors (server-side validation), shown like ours.
  const serverField = (f: string) => state.errors?.getFieldErrors(f).map((x) => x.message).join(" ") || undefined;
  const fieldError = {
    location: errors.location ?? serverField("location"),
    rise: errors.rise ?? serverField("rise_ft"),
    email: errors.email ?? serverField("email"),
  };
  const formError = state.errors
    ?.getFormErrors()
    .map((x) => x.message.trim().replace(/([^.!?])$/, "$1."))
    .join(" ");

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <h2 id={ids.title} className="text-h4 font-semibold">
          Know a hill?
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close hill suggestion"
          className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-md outline-none hover:bg-ghost-hover focus-visible:ring-3 focus-visible:ring-ring"
        >
          <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
          </svg>
        </button>
      </div>
      <p id={ids.intro} className="mt-1 text-p-sm text-muted-foreground">
        Found a Chicago-area hill worth running? Tell us where it is and what makes it worth climbing.
      </p>

      {state.succeeded ? (
        <p ref={doneRef} tabIndex={-1} role="status" className="mt-5 rounded-lg bg-accent p-4 text-p-sm outline-none">
          Thanks for the suggestion! We&apos;ll take a look and see if it&apos;s worth adding to the rotation.
        </p>
      ) : (
        <form noValidate onSubmit={onSubmit} aria-describedby={formError ? ids.formError : undefined} className="mt-5 flex flex-col gap-4">
          <Field id={ids.name} label="Hill name" optional>
            <Input ref={nameRef} id={ids.name} name="hill_name" maxLength={LIMITS.name} className="h-10" />
          </Field>
          <Field id={ids.location} label="Address or map pin" hint="A street address, a landmark, a Google Maps link or coordinates." error={fieldError.location}>
            <Input
              ref={locationRef}
              id={ids.location}
              name="location"
              required
              aria-required="true"
              maxLength={LIMITS.location}
              aria-invalid={fieldError.location ? true : undefined}
              aria-describedby={cn(`${ids.location}-hint`, fieldError.location && `${ids.location}-error`)}
              className="h-10"
            />
          </Field>
          <Field id={ids.rise} label="Elevation gain / rise (ft)" optional error={fieldError.rise}>
            <Input
              ref={riseRef}
              id={ids.rise}
              name="rise_ft"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              aria-invalid={fieldError.rise ? true : undefined}
              aria-describedby={fieldError.rise ? `${ids.rise}-error` : undefined}
              className="h-10"
            />
          </Field>
          <Field id={ids.surface} label="Surface" optional>
            <select
              id={ids.surface}
              name="surface"
              defaultValue=""
              className="h-10 w-full rounded-lg border border-border bg-input px-(--space-md) text-p-sm text-foreground shadow-xs outline-none focus-visible:border-border-4 focus-visible:ring-3 focus-visible:ring-ring"
            >
              <option value="">Choose one</option>
              {HILL_SURFACES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field id={ids.notes} label="What do you love about this hill?" optional>
            <textarea id={ids.notes} name="notes" rows={3} maxLength={LIMITS.notes} className={textareaClass} />
          </Field>
          <Field id={ids.email} label="Your email" optional hint="Only if you'd like us to follow up." error={fieldError.email}>
            <Input
              ref={emailRef}
              id={ids.email}
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              maxLength={LIMITS.email}
              aria-invalid={fieldError.email ? true : undefined}
              aria-describedby={cn(`${ids.email}-hint`, fieldError.email && `${ids.email}-error`)}
              className="h-10"
            />
          </Field>
          {/* Identifies this form in the Formspree inbox; the honeypot is for bots, never seen by people. */}
          <input type="hidden" name="form" value={HILL_SUGGESTION_IDENTIFIER} />
          <input type="hidden" name="_subject" value="CMR hill suggestion" />
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

          {formError && (
            <p id={ids.formError} role="alert" className="rounded-lg border border-destructive-border p-3 text-p-sm">
              Your suggestion didn&apos;t send. {formError} Please try again.
            </p>
          )}

          <Button type="submit" size="lg" disabled={state.submitting} aria-disabled={state.submitting || undefined} className="self-start">
            {state.submitting ? "Sending…" : "Suggest a hill"}
          </Button>
        </form>
      )}
    </>
  );
}
