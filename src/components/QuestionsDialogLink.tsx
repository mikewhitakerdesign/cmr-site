"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { QuestionsDialog } from "@/components/QuestionsDialog";
import { cn } from "@/lib/utils";

/** False on the server and during hydration, true afterwards: for portaling to <body> without a mismatch. */
export const useIsClient = () => useSyncExternalStore(() => () => {}, () => true, () => false);

export const INLINE_LINK_BUTTON =
  "cursor-pointer rounded-xs underline decoration-1 underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(--focus-offset)";

/**
 * An inline text link (a button, because it acts rather than navigates) that opens the Questions form in the
 * centered QuestionsDialog and returns focus to itself on close. Used by /calendar (Hills on pause) and the FAQ.
 * The dialog is portaled to <body>: the link usually sits inside a <p>, where a <dialog> is invalid, and the
 * dialog should inherit neither the surrounding text color or alignment nor the link's focus ring.
 */
export function QuestionsDialogLink({ children, className }: { children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const mounted = useIsClient();
  const close = () => {
    setOpen(false);
    ref.current?.focus();
  };
  return (
    <>
      <button ref={ref} type="button" aria-haspopup="dialog" onClick={() => setOpen(true)} className={cn(INLINE_LINK_BUTTON, className)}>
        {children}
      </button>
      {mounted && createPortal(<QuestionsDialog open={open} onClose={close} />, document.body)}
    </>
  );
}
