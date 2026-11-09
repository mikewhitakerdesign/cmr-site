import type { ReactNode } from "react";
import { Container } from "@/components/Container";
import { EYEBROW } from "@/components/hills/styles";
import { sourceAnchor, sourceById, sourceNumber, shortCitation } from "@/content/science-sources";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { DISPLAY_HEADING } from "@/lib/headings";
import { SCIENCE_SECTIONS, sectionNumber, type ScienceSectionId } from "@/lib/science";
import { cn } from "@/lib/utils";

/**
 * Editorial building blocks for The Science. Server Components, no client JS.
 *
 * Rhythm: sections are separated by generous padding and a hairline rule, not
 * boxes. Body copy keeps a reading measure (680px, ≈ 70 characters at 18px);
 * figures may run wider. Type sizes follow the site: the section heading is
 * the CMR display style, scaled down slightly from the hill pages' 96px so
 * eight of them can share one long page.
 */

export const BODY_COPY = "text-[18px] leading-[30px] text-foreground/85";
export const MEASURE = "max-w-[680px]";

export function ScienceSection({ id, heading, children }: { id: ScienceSectionId; heading: ReactNode; children: ReactNode }) {
  const label = SCIENCE_SECTIONS.find((s) => s.id === id)!.label;
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      data-slot="science-section"
      className={cn(
        "border-t border-foreground/15 py-20 first-of-type:border-t-0 md:py-28 lg:py-32",
        // A jump lands on the eyebrow, not on the empty top padding above it (scroll-padding adds the clearance).
        "-scroll-mt-20 md:-scroll-mt-28 lg:-scroll-mt-32",
      )}
    >
      <Container>
        <p className={cn(EYEBROW, "text-[13px] text-foreground/65 md:text-[14px]")}>
          <span aria-hidden>{sectionNumber(id)} · </span>
          {label}
        </p>
        <h2
          id={`${id}-heading`}
          style={fluidType([40, 52, 80], [42, 54, 80])}
          className={cn(FLUID_TYPE, DISPLAY_HEADING, "mt-4 max-w-[16ch] text-balance md:mt-5")}
        >
          {heading}
        </h2>
        <div className="mt-10 md:mt-14">{children}</div>
      </Container>
    </section>
  );
}

/** Running text at the reading measure. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(MEASURE, BODY_COPY, "flex flex-col gap-5", className)}>{children}</div>;
}

/** A subsection heading inside a section. */
export function Subhead({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h3
      id={id}
      className={cn(MEASURE, "mt-16 mb-5 text-[24px] leading-[30px] font-semibold tracking-[-0.4px] text-foreground md:mt-20 md:text-[28px] md:leading-[34px]", className)}
    >
      {children}
    </h3>
  );
}

/**
 * A figure: diagram or interactive, wider than the text, with a caption at
 * the reading measure.
 */
export function Figure({
  children,
  caption,
  className,
  label,
}: {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
  /** Short label shown above the figure ("Figure 1 · Incline geometry"). */
  label?: string;
}) {
  return (
    <figure className={cn("my-14 md:my-20", className)}>
      {label && <p className={cn(EYEBROW, "mb-5 text-[12px] leading-5 text-foreground/65 md:text-[13px]")}>{label}</p>}
      {children}
      {caption && <figcaption className={cn(MEASURE, "mt-5 text-p-sm text-muted-foreground")}>{caption}</figcaption>}
    </figure>
  );
}

/** A definition-style list of short labelled points (not cards). */
export function TermList({ items, className }: { items: [ReactNode, ReactNode][]; className?: string }) {
  return (
    <dl className={cn(MEASURE, "border-b border-foreground/15", className)}>
      {items.map(([term, detail], i) => (
        <div key={i} className="grid gap-1 border-t border-foreground/15 py-5 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">
          <dt className="text-[17px] leading-[26px] font-semibold text-foreground">{term}</dt>
          <dd className={BODY_COPY}>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Inline citation: "[1]" or "[1, 2]", each number linking to its entry under
 * Sources. Screen readers hear "Source 1, Minetti et al., 2002" instead of
 * bracket characters.
 */
export function Cite({ ids }: { ids: string[] }) {
  return (
    <span data-slot="cite" className="text-[0.8em] whitespace-nowrap text-foreground/70">
      <span aria-hidden>[</span>
      {ids.map((id, i) => {
        const n = sourceNumber(id);
        return (
          <span key={id}>
            {i > 0 && <span aria-hidden>, </span>}
            <a
              href={`#${sourceAnchor(id)}`}
              // The visible number is part of the name (WCAG 2.5.3); brackets are not read.
              aria-label={`Source ${n}, ${shortCitation(sourceById(id))}`}
              className="rounded-xs text-foreground underline decoration-foreground/30 underline-offset-2 outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring"
            >
              {n}
            </a>
          </span>
        );
      })}
      <span aria-hidden>]</span>
    </span>
  );
}
