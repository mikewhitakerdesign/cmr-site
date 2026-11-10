"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A link back to the top of the current page (PR #4 final refinements: the
 * footer wordmark). A real link: `#top` scrolls to the top in any browser,
 * even without JavaScript. With it, the scroll is smooth (instant under
 * reduced motion), the URL keeps no fragment, and keyboard focus moves to the
 * first focusable element at the top (the skip link), so the next Tab
 * continues from the top instead of the footer.
 */
export function BackToTopLink({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <a
      href="#top"
      aria-label={label}
      className={cn("outline-none focus-visible:ring-3 focus-visible:ring-ring", className)}
      onClick={(e) => {
        e.preventDefault();
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.querySelector<HTMLElement>("body a[href], body button")?.focus({ preventScroll: true });
      }}
    >
      {children}
    </a>
  );
}
