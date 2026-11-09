"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarPlusIcon, NavigationIcon, ShareIcon } from "@/components/icons";
import { ctaLinkVariants } from "@/components/CtaLink";
import { cn } from "@/lib/utils";

const BTN = "h-12 gap-2 px-5 text-[16px] leading-6 font-medium";

/**
 * Add to calendar, Get directions and Share for a run page.
 *
 * Add to calendar opens a small menu (a disclosure, not an ARIA menu) with
 * "Just this run" (the next real date) and "Entire recurring series", both
 * plain download links to the .ics route, plus a note that a download does not
 * sync later changes. Share uses the native sheet on touch devices that have
 * one and otherwise copies the page URL, saying so in a live region.
 */
export function RunActions({
  slug,
  title,
  nextDate,
  recurring,
  directionsUrl,
}: {
  slug: string;
  title: string;
  /** The next real (not cancelled) occurrence date, or null when there is none. */
  nextDate: string | null;
  recurring: boolean;
  directionsUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        wrap.current?.querySelector<HTMLElement>("button")?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function share() {
    const url = window.location.origin + window.location.pathname;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg("Link copied.");
    } catch {
      setShareMsg(`Copy this link: ${url}`);
    }
  }

  const link = "block rounded-md px-3 py-2 text-[15px] leading-6 outline-none hover:bg-foreground hover:text-background focus-visible:ring-3 focus-visible:ring-ring";

  return (
    <div className="flex flex-wrap items-start gap-3">
      {nextDate && (
        <div ref={wrap} className="relative">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((o) => !o)}
            className={cn(ctaLinkVariants({ variant: "primary" }), BTN)}
          >
            <CalendarPlusIcon className="size-4" />
            Add to calendar
          </button>
          <div
            id={menuId}
            hidden={!open}
            className="absolute top-full left-0 z-20 mt-2 w-[min(320px,calc(100vw-48px))] rounded-lg border border-foreground bg-background p-2 text-foreground shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
          >
            <a className={link} href={`/calendar/${slug}/ics?scope=occurrence&date=${nextDate}`} download>
              Just this run
            </a>
            {recurring && (
              <a className={link} href={`/calendar/${slug}/ics?scope=series`} download>
                Entire recurring series
              </a>
            )}
            <p className="px-3 pt-2 pb-1 text-[13px] leading-5 text-foreground/75">
              Downloaded calendar entries won&apos;t automatically sync later changes or cancellations.
            </p>
          </div>
        </div>
      )}

      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(ctaLinkVariants({ variant: "outline" }), BTN)}
        >
          <NavigationIcon className="size-4" />
          Get directions
          <span className="sr-only"> (opens Google Maps in a new tab)</span>
        </a>
      )}

      <button type="button" onClick={share} className={cn(ctaLinkVariants({ variant: "outline" }), BTN)}>
        <ShareIcon className="size-4" />
        Share
      </button>
      <p role="status" className="basis-full text-[14px] leading-5 text-foreground/75 empty:hidden">
        {shareMsg}
      </p>
    </div>
  );
}
