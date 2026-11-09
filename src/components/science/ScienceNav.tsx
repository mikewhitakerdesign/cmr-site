"use client";

import { useEffect, useRef, useState } from "react";
import { SCIENCE_SECTIONS, type ScienceSectionId } from "@/lib/science";
import { cn } from "@/lib/utils";

/** The line, as a fraction of the viewport height, a section's top must pass to become current. */
export const ACTIVE_LINE = 0.35;

/**
 * Which section is current: the last one whose top has passed the activation
 * line. Above the first section (the hero) there is none.
 */
export function activeSection(tops: number[], line: number): number {
  let active = -1;
  for (let i = 0; i < tops.length; i++) if (tops[i] <= line) active = i;
  return active;
}

/**
 * Sticky subsection navigation for The Science, directly under the site header.
 *
 * Position: sticky, with `top` set to the bottom edge of the site header's
 * visible bar, measured, not assumed. The header keeps its layout box but
 * shrinks its bar on tablet and desktop (compact) and slides its top row away
 * on phones (HeaderShell), so this follows the bar: on a change of the
 * header's `data-compact` / `data-hide-top` it tracks the bar for the length
 * of the header's 300ms transition, then stops. Before hydration, CSS
 * defaults per breakpoint stand in. It never changes layout (sticky offset
 * only), so nothing on the page shifts.
 *
 * Current section: an IntersectionObserver per section fires only when a
 * section crosses the activation line; the active item is then the last
 * section whose top is above it. No scroll listener on the page.
 *
 * Phones and tablets: one row that scrolls sideways (never wraps), with a fade
 * at whichever edge has more items; the current item is kept in view. The
 * page itself never scrolls sideways.
 *
 * Anchors are native `<a href="#id">`, so keyboard, middle-click, fragment
 * URLs and history all behave normally. Scroll offsets come from
 * `scroll-padding-top` on this page (src/styles/cmr.css), sized to the
 * tallest header state plus this bar, so headings are never hidden.
 */
export function ScienceNav() {
  const navRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ScienceSectionId | null>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const pinRef = useRef<(id: string) => void>(undefined);

  // Follow the site header's visible bar.
  useEffect(() => {
    const nav = navRef.current;
    const header = document.querySelector<HTMLElement>("body > header");
    const bar = header?.querySelector<HTMLElement>("[data-slot=header-bar]");
    if (!nav || !header || !bar) return;
    let raf = 0;
    let until = 0;
    const place = () => {
      const bottom = Math.max(0, Math.round(bar.getBoundingClientRect().bottom));
      nav.style.top = `${bottom}px`;
    };
    const follow = () => {
      place();
      if (performance.now() < until) raf = requestAnimationFrame(follow);
      else raf = 0;
    };
    const track = () => {
      until = performance.now() + 450; // the header animates for 300ms
      if (!raf) raf = requestAnimationFrame(follow);
    };
    place();
    const mo = new MutationObserver(track);
    mo.observe(header, { attributes: true, attributeFilter: ["data-compact", "data-hide-top"] });
    const ro = new ResizeObserver(track);
    ro.observe(bar);
    window.addEventListener("resize", track);
    return () => {
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", track);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Track the current section.
  useEffect(() => {
    const sections = SCIENCE_SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;
    let lockUntil = 0;
    const update = () => {
      if (performance.now() < lockUntil) return;
      const i = activeSection(
        sections.map((el) => el.getBoundingClientRect().top),
        window.innerHeight * ACTIVE_LINE,
      );
      setActive(i < 0 ? null : (sections[i].id as ScienceSectionId));
    };
    const io = new IntersectionObserver(update, { rootMargin: `0px 0px -${100 - ACTIVE_LINE * 100}% 0px`, threshold: [0, 1] });
    for (const el of sections) io.observe(el);
    // A chosen section shows right away and holds until the scroll that follows settles.
    const pin = (id: string) => {
      if (!SCIENCE_SECTIONS.some((s) => s.id === id)) return;
      setActive(id as ScienceSectionId);
      lockUntil = performance.now() + 1200;
      const release = () => {
        lockUntil = 0;
        update();
      };
      window.addEventListener("scrollend", release, { once: true });
      setTimeout(release, 1300);
    };
    pinRef.current = pin;
    const onHash = () => pin(decodeURIComponent(location.hash.slice(1)));
    window.addEventListener("hashchange", onHash);
    update();
    return () => {
      io.disconnect();
      pinRef.current = undefined;
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  // Fades at the edges of the sideways-scrolling row.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1 });
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, []);

  // Keep the current item in view in the row (horizontal only; the page doesn't move).
  useEffect(() => {
    const el = scrollerRef.current;
    const link = active && el?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    if (!el || !link) return;
    const pad = 24;
    const left = link.offsetLeft - pad;
    const right = link.offsetLeft + link.offsetWidth + pad - el.clientWidth;
    const target = el.scrollLeft > left ? left : el.scrollLeft < right ? right : null;
    if (target === null) return;
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target, behavior: smooth ? "smooth" : "auto" });
  }, [active]);

  return (
    <nav
      ref={navRef}
      aria-label="On this page"
      data-slot="science-nav"
      className={cn(
        "sticky z-40 border-b border-foreground/15 bg-background text-foreground",
        // Pre-hydration stand-ins for the header bar's bottom edge; replaced by the measured value.
        "top-[114px] md:top-[100px] lg:top-[123px]",
      )}
    >
      <div
        ref={scrollerRef}
        data-slot="science-nav-scroller"
        data-fade-start={edges.start ? undefined : ""}
        data-fade-end={edges.end ? undefined : ""}
        className={cn(
          "mx-auto max-w-[1400px] overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "data-[fade-end]:[mask-image:linear-gradient(to_right,black_calc(100%-48px),transparent)]",
          "data-[fade-start]:[mask-image:linear-gradient(to_left,black_calc(100%-48px),transparent)]",
          "data-[fade-start]:data-[fade-end]:[mask-image:linear-gradient(to_right,transparent,black_48px,black_calc(100%-48px),transparent)]",
        )}
      >
        <ul className="flex w-max min-w-full gap-6 px-6 md:gap-8 md:px-12 lg:gap-10">
          {SCIENCE_SECTIONS.map((s) => {
            const current = active === s.id;
            return (
              <li key={s.id} className="flex">
                <a
                  href={`#${s.id}`}
                  onClick={() => pinRef.current?.(s.id)}
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    "relative flex h-12 items-center text-[14px] leading-5 font-medium whitespace-nowrap outline-none",
                    "text-foreground/65 hover:text-foreground aria-[current=location]:text-foreground",
                    "focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset focus-visible:rounded-xs",
                    // The current-item rule sits on the bar's bottom edge.
                    "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-foreground after:opacity-0 aria-[current=location]:after:opacity-100",
                    "motion-safe:transition-colors motion-safe:after:transition-opacity",
                  )}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
