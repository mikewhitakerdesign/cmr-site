"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon, DownloadIcon } from "@/components/brand/icons";
import { SectionNav } from "@/components/SectionNav";
import { LANDING_SECTIONS, MANUAL, chapterPath, type ChapterOutline } from "@/lib/brand/manual";
import { cn } from "@/lib/utils";

/**
 * The Brand Standards' one sticky row, under the site header on /brand and
 * every chapter. It is the shared SectionNav (The Science, the FAQ) with two
 * pinned ends, so there is a single sticky interface, not two:
 *
 *   [ 03 Color ▾ ]   Core · Mint · Tints · …   [ Download PDF ]
 *     chapters        this page's sections       the whole manual
 *
 * - Left: the chapter menu, a disclosure that opens a panel of all chapters
 *   under the row. It moves between pages.
 * - Middle: this page's sections, with SectionNav's current-section tracking
 *   and sideways scrolling. It moves within the page.
 * - Right: Download PDF, the complete manual (a static file), on every page.
 */
export function BrandNav({ chapters }: { chapters: readonly ChapterOutline[] }) {
  const pathname = usePathname();
  const current = chapters.find((c) => pathname === chapterPath(c.slug));
  const sections = current ? current.sections : LANDING_SECTIONS;

  return (
    <SectionNav
      // A new page has new sections: start its tracking fresh.
      key={pathname}
      sections={sections}
      label="Brand Standards"
      slot="brand-nav"
      leading={<ChapterMenu key={pathname} chapters={chapters} current={current} />}
      trailing={<PdfLink />}
    />
  );
}

const ITEM = "flex h-12 shrink-0 items-center gap-2 text-[14px] leading-5 font-semibold whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset";

/**
 * When the row is still low on the page (a phone, above the first section), the
 * panel it opens would be below the fold and nothing would appear to happen.
 * After it opens, if any of its links is off screen, bring the row to the top
 * (SectionNav's scroll padding keeps it clear of the site header).
 */
function revealPanel(button: HTMLElement | null, panelId: string) {
  requestAnimationFrame(() => {
    const panel = document.getElementById(panelId);
    const nav = button?.closest("nav");
    const links = panel?.querySelectorAll("a");
    if (!panel || !nav || !links?.length) return;
    // All of it, not just the first link: a panel that opens half below the fold needs the row brought up too.
    const top = links[0].getBoundingClientRect().top;
    const bottom = links[links.length - 1].getBoundingClientRect().bottom;
    if (top >= 0 && bottom <= window.innerHeight) return;
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    nav.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
  });
}

function ChapterMenu({ chapters, current }: { chapters: readonly ChapterOutline[]; current?: ChapterOutline }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const link = cn(
    "group/ch flex items-baseline gap-3 rounded-xs py-2.5 text-[15px] leading-5 font-medium outline-none",
    "underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring",
    "aria-[current=page]:font-black",
  );

  return (
    // Not positioned: the panel is placed against the sticky bar itself, so it spans the full row.
    <div ref={rootRef} data-slot="brand-chapter-menu" className="flex">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          const opening = !open;
          setOpen(opening);
          if (opening) revealPanel(buttonRef.current, panelId);
        }}
        className={cn(ITEM, "border-r border-foreground/15 pr-4 pl-6 md:pr-5 md:pl-12")}
      >
        <span className="sr-only">Chapters. Current: </span>
        {current ? (
          <>
            <span className="font-mono text-[13px] font-normal">{current.number}</span>
            <span className="max-md:sr-only">{current.name}</span>
          </>
        ) : (
          <>
            <span className="max-md:hidden">Overview</span>
            <span aria-hidden className="md:hidden">
              Menu
            </span>
            <span className="sr-only md:hidden">Overview</span>
          </>
        )}
        <ChevronDownIcon className={cn("size-4 shrink-0 motion-safe:transition-transform", open && "rotate-180")} />
      </button>

      <div
        id={panelId}
        hidden={!open}
        data-slot="brand-chapter-panel"
        className="absolute inset-x-0 top-full z-10 max-h-[calc(100dvh-12rem)] overflow-y-auto border-y border-foreground bg-background shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
      >
        <div className="mx-auto max-w-[1400px] px-6 py-6 md:px-12 md:py-8">
          <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
            <li>
              <Link href="/brand" aria-current={current ? undefined : "page"} className={link}>
                <span className="w-6 shrink-0 font-mono text-[12px] font-normal text-foreground/60">00</span>
                Overview
              </Link>
            </li>
            {chapters.map((c) => (
              <li key={c.slug}>
                <Link href={chapterPath(c.slug)} aria-current={current?.slug === c.slug ? "page" : undefined} className={link}>
                  <span className="w-6 shrink-0 font-mono text-[12px] font-normal text-foreground/60">{c.number}</span>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PdfLink() {
  return (
    <a
      href={MANUAL.pdfHref}
      download={MANUAL.pdfDownloadName}
      data-slot="brand-pdf-link"
      // One label, so the name reads as a sentence (separate flex children would add a space before the comma).
      // The visible text ("Download PDF", or "PDF" on phones) is contained in it.
      aria-label={`Download PDF, the complete manual, version ${MANUAL.version}`}
      className={cn(ITEM, "border-l border-foreground/15 pr-6 pl-4 underline-offset-4 hover:underline md:pr-12 md:pl-5")}
    >
      <DownloadIcon className="size-4 shrink-0" />
      <span aria-hidden className="md:hidden">
        PDF
      </span>
      <span aria-hidden className="max-md:hidden">
        Download PDF
      </span>
    </a>
  );
}
