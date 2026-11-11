"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ModalDialog } from "@/components/QuestionsDialog";
import { INLINE_LINK_BUTTON, useIsClient } from "@/components/QuestionsDialogLink";
import { HillSuggestionPanel, hillSuggestionIds } from "@/components/hills/HillSuggestionPanel";
import { cn } from "@/lib/utils";

/**
 * An inline text link (a button, because it acts) that opens the "Know a hill?" suggestion form in the shared
 * ModalDialog and returns focus to itself on close. Portaled to <body> like QuestionsDialogLink, because it sits
 * inside a <p>.
 */
export function HillSuggestionLink({ children, className }: { children: ReactNode; className?: string }) {
  const uid = useId();
  const ids = hillSuggestionIds(uid);
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  const ref = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    ref.current?.focus();
  };
  return (
    <>
      <button ref={ref} type="button" aria-haspopup="dialog" onClick={() => setOpen(true)} className={cn(INLINE_LINK_BUTTON, className)}>
        {children}
      </button>
      {mounted &&
        createPortal(
          <ModalDialog open={open} onClose={close} labelledBy={ids.title} describedBy={ids.intro}>
            <HillSuggestionPanel idBase={uid} open={open} onClose={close} />
          </ModalDialog>,
          document.body,
        )}
    </>
  );
}
