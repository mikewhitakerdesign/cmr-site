"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { QuestionsPanel, questionsPanelIds } from "@/components/QuestionsPanel";
import { cn } from "@/lib/utils";

export { validateQuestion } from "@/components/QuestionsPanel";

/**
 * Floating "Questions?" contact panel (homepage Round 2, Owner direction
 * 2026-11-08). A CMR take on the floating-question pattern from the Owner's
 * Methods project, not a copy of it.
 *
 * Delivery: Formspree (Owner-provided form `mwlljgld`) through the official
 * `@formspree/react` `useForm` hook. The browser posts to Formspree, which
 * emails the club founder; nothing is stored by this app, there is no CMR
 * email API, and no recipient address lives in the repository. Formspree's
 * spam filtering applies, plus its `_gotcha` honeypot field.
 *
 * The form itself (fields, validation, sending, success, errors) is
 * QuestionsPanel, shared with the centered QuestionsDialog.
 *
 * Behavior:
 *   - trigger: a pill fixed to the bottom right; toggles the panel
 *     (aria-expanded / aria-controls)
 *   - panel: a non-modal dialog; opening focuses the question field; Escape or
 *     the close button closes it and returns focus to the trigger; a draft
 *     survives closing and reopening
 */
export function QuestionsWidget() {
  const uid = useId();
  const panelId = `${uid}-panel`;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
  };

  const ids = questionsPanelIds(uid);

  return (
    <div data-overlay className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      <div
        id={panelId}
        role="dialog"
        aria-modal="false"
        aria-labelledby={ids.title}
        aria-describedby={ids.intro}
        hidden={!open}
        onKeyDown={onKeyDown}
        className={cn(
          "w-[min(380px,calc(100vw-2rem))] max-h-[calc(100dvh-6.5rem)] overflow-y-auto",
          "rounded-xl border border-foreground bg-background p-5 text-foreground shadow-lg md:p-6",
        )}
      >
        <QuestionsPanel idBase={uid} open={open} onClose={close} />
      </div>

      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        data-slot="questions-trigger"
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full border border-foreground bg-accent px-4 text-p-sm font-semibold text-accent-foreground shadow-md outline-none",
          "motion-safe:transition-[background-color,transform] motion-safe:duration-150 hover:bg-(color:--cmr-tint-mint-wash) motion-safe:active:translate-y-px",
          "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round">
          <path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" />
        </svg>
        {open ? "Close" : "Questions?"}
      </button>
    </div>
  );
}
