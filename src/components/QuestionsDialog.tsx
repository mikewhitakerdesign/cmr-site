"use client";

import { useEffect, useId, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { QuestionsPanel, questionsPanelIds } from "@/components/QuestionsPanel";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A modal <dialog> keeps the rest of the page inert, but Tab from its last control still moves focus out to
 * the browser's own interface. Wrap it so focus stays on the dialog's controls.
 */
function trapTab(e: KeyboardEvent<HTMLDialogElement>) {
  if (e.key !== "Tab") return;
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0);
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || active === e.currentTarget)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

/**
 * The Questions form as a centered modal dialog (Owner direction, 2026-11-11),
 * opened from an inline link (e.g. "send us your questions" on /calendar while
 * official runs are on hold). The form is QuestionsPanel, the same component
 * the floating "Questions?" panel renders, so the Formspree endpoint,
 * validation, sending, success and error states are shared, not copied.
 *
 * A native <dialog> opened with showModal(): the browser traps focus inside it,
 * makes the rest of the page inert, stacks it in the top layer and fires a
 * `close` event on Escape. This component adds what the platform does not:
 *   - a translucent white backdrop (the page stays faintly visible),
 *   - dismissal by the close button, Escape, or a click on the backdrop,
 *   - background scroll lock while open (compensating for the scrollbar),
 *   - focus moved to the question field on open.
 * The opener restores focus to itself in `onClose`.
 *
 * The panel stays mounted while the dialog is closed, so a draft survives.
 */
export function QuestionsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const uid = useId();
  const ids = questionsPanelIds(uid);
  const ref = useRef<HTMLDialogElement>(null);
  const pressedOnBackdrop = useRef(false);

  // Layout effect: the dialog must be open before QuestionsPanel's effect focuses the question field.
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = previous.overflow;
      root.style.paddingRight = previous.paddingRight;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={ids.title}
      aria-describedby={ids.intro}
      // Native Escape (and dialog.close()) land here, so state follows the platform.
      onClose={onClose}
      // The dialog has no padding of its own, so a press on the dialog element itself is a press on the backdrop.
      onMouseDown={(e) => {
        pressedOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pressedOnBackdrop.current) onClose();
      }}
      onKeyDown={trapTab}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(480px,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-xl border border-foreground bg-background p-0 text-foreground shadow-lg backdrop:bg-[rgb(255_255_255/0.65)]"
    >
      <div className="p-5 md:p-8">
        <QuestionsPanel idBase={uid} open={open} onClose={onClose} />
      </div>
    </dialog>
  );
}
