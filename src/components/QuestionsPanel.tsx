"use client";

import { useForm } from "@formspree/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Field } from "@/components/form/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUESTIONS_FORM_ID } from "@/lib/questions";
import { isEmail } from "@/lib/validation";
import { cn } from "@/lib/utils";

type Fields = { message: string; email: string; name: string };
type FieldErrors = Partial<Record<"message" | "email", string>>;

/** Client-side checks, mirrored by Formspree's own validation on the server. */
export function validateQuestion(values: { message: string; email: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.message.trim()) errors.message = "Add your question.";
  if (!values.email.trim()) errors.email = "Add your email so we can reply.";
  else if (!isEmail(values.email)) errors.email = "That email doesn't look right. Check it and try again.";
  return errors;
}

const textareaClass = cn(
  "min-h-28 w-full resize-y rounded-lg border border-border bg-input px-(--space-md) py-2.5 shadow-xs",
  "text-p-sm text-foreground placeholder:text-muted-foreground outline-none transition-[color,box-shadow,border-color]",
  "focus-visible:border-border-4 focus-visible:ring-3 focus-visible:ring-ring",
  "aria-invalid:border-destructive-border aria-invalid:focus-visible:ring-ring-error",
);

/** Ids a container needs to label itself with the panel's heading and intro. */
export const questionsPanelIds = (idBase: string) => ({ title: `${idBase}-title`, intro: `${idBase}-intro` });

/**
 * The Questions form and its states: heading, intro, the form, validation,
 * sending, success and error. Shared by the floating "Questions?" panel
 * (QuestionsWidget) and the centered dialog (QuestionsDialog), so there is one
 * implementation of the form, its Formspree endpoint and its behavior.
 *
 * The container owns open/closed and passes `open` so the question field is
 * focused each time it opens. The panel stays mounted while its container is
 * closed, so a draft survives closing and reopening.
 */
export function QuestionsPanel({ idBase, open, onClose }: { idBase: string; open: boolean; onClose: () => void }) {
  const ids = {
    ...questionsPanelIds(idBase),
    message: `${idBase}-message`,
    email: `${idBase}-email`,
    name: `${idBase}-name`,
    formError: `${idBase}-form-error`,
  };
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, submit, reset] = useForm<Fields>(QUESTIONS_FORM_ID);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);
  const [sentTo, setSentTo] = useState("");

  useEffect(() => {
    if (open) (state.succeeded ? doneRef : messageRef).current?.focus();
  }, [open, state.succeeded]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const values = { message: String(data.get("message") ?? ""), email: String(data.get("email") ?? "") };
    const found = validateQuestion(values);
    setErrors(found);
    if (found.message) return messageRef.current?.focus();
    if (found.email) return emailRef.current?.focus();
    setSentTo(values.email.trim());
    await submit(e);
  };

  // Formspree's own field errors (server-side validation), shown like ours.
  const serverField = (f: keyof Fields) => state.errors?.getFieldErrors(f).map((x) => x.message).join(" ") || undefined;
  const fieldError = {
    message: errors.message ?? serverField("message"),
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
          Questions about the club?
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close questions"
          className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-md outline-none hover:bg-ghost-hover focus-visible:ring-3 focus-visible:ring-ring"
        >
          <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
          </svg>
        </button>
      </div>
      <p id={ids.intro} className="mt-1 text-p-sm text-muted-foreground">
        Ask away. No question is too small. Meetups, fitness levels, what to bring. It goes to the club&apos;s
        founder, who usually replies within a day or so.
      </p>

      {state.succeeded ? (
        <div className="mt-5">
          <p ref={doneRef} tabIndex={-1} role="status" className="rounded-lg bg-accent p-4 text-p-sm outline-none">
            <strong className="block font-semibold">Thanks, your question is on its way.</strong>
            Watch for a reply{sentTo ? ` at ${sentTo}` : ""}.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => {
              reset();
              setErrors({});
              requestAnimationFrame(() => messageRef.current?.focus());
            }}
          >
            Ask another question
          </Button>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} aria-describedby={formError ? ids.formError : undefined} className="mt-5 flex flex-col gap-4">
          <Field id={ids.message} label="Your question" error={fieldError.message}>
            <textarea
              ref={messageRef}
              id={ids.message}
              name="message"
              required
              maxLength={2000}
              rows={4}
              placeholder="How fast do I need to be? (You don't.)"
              aria-invalid={fieldError.message ? true : undefined}
              aria-describedby={fieldError.message ? `${ids.message}-error` : undefined}
              className={textareaClass}
            />
          </Field>
          <Field id={ids.email} label="Email" hint="So we can reply." error={fieldError.email}>
            <Input
              ref={emailRef}
              id={ids.email}
              name="email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              maxLength={254}
              aria-invalid={fieldError.email ? true : undefined}
              aria-describedby={cn(`${ids.email}-hint`, fieldError.email && `${ids.email}-error`)}
              className="h-10"
            />
          </Field>
          <Field id={ids.name} label="Name" optional>
            <Input id={ids.name} name="name" autoComplete="name" maxLength={100} className="h-10" />
          </Field>
          {/* Formspree honeypot: bots fill it, people never see it. */}
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

          {formError && (
            <p id={ids.formError} role="alert" className="rounded-lg border border-destructive-border p-3 text-p-sm">
              Your question didn&apos;t send. {formError} Please try again.
            </p>
          )}

          <Button type="submit" size="lg" disabled={state.submitting} aria-disabled={state.submitting || undefined} className="self-start">
            {state.submitting ? "Sending…" : "Send question"}
          </Button>
        </form>
      )}
    </>
  );
}
