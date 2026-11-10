import { Children, isValidElement, type ReactNode } from "react";
import { Container } from "@/components/Container";
import { EYEBROW } from "@/components/hills/styles";
import { sourceAnchor, sourceById, sourceNumber, shortCitation } from "@/content/science-sources";
import { FLUID_TYPE } from "@/lib/fluid";
import { DISPLAY_HEADING, standardH2 } from "@/lib/headings";
import { SCIENCE_SECTIONS, sectionTone, type ScienceSectionId } from "@/lib/science";
import { grayTintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

/**
 * Editorial building blocks for The Science. Server Components, no client JS.
 *
 * Rhythm (refinement pass, Owner direction 2026-11-09):
 *   - sections alternate white and black full-width fills (Physics white,
 *     Physiology black, …, Sources black); the fill separates them, no rules.
 *     Black sections invert the palette by scoping the theme variables
 *     (`.science-dark`, src/styles/cmr.css), so text, citations, rules and
 *     focus rings follow automatically.
 *   - from 1280px, text and its figure sit side by side (`SplitRow`); the
 *     figure alternates sides by section and stays in view (sticky) while its
 *     text scrolls. Below 1280 they stack, text first. The text always comes
 *     first in the DOM, so reading order matches on every screen.
 *   - figures sit in a rounded frame filled with the homepage's grayscale
 *     tie-dye (the "TBD" circles: `cmr-tie-dye` with `grayTintVars`), which
 *     restores the light palette inside black sections.
 *
 * Body copy keeps a reading measure (≤ 680px). The section heading is the Standard H2 role (src/lib/headings.ts).
 */

export const BODY_COPY = "text-[18px] leading-[30px] text-foreground/85";
export const MEASURE = "max-w-[680px]";

/** Side-by-side from this breakpoint (xl, 1280px); stacked below it. Instructions use the same one. */
export const SPLIT = "xl";

export function ScienceSection({ id, heading, children }: { id: ScienceSectionId; heading: ReactNode; children: ReactNode }) {
  const label = SCIENCE_SECTIONS.find((s) => s.id === id)!.label;
  const dark = sectionTone(id) === "dark";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      data-slot="science-section"
      data-tone={dark ? "dark" : "light"}
      className={cn(
        "bg-background py-20 text-foreground md:py-28 lg:py-32",
        dark && "science-dark",
        // A jump lands on the eyebrow, not on the empty top padding above it (scroll-padding adds the clearance).
        "-scroll-mt-20 md:-scroll-mt-28 lg:-scroll-mt-32",
      )}
    >
      <Container>
        <p data-slot="science-eyebrow" className={cn(EYEBROW, "text-[13px] text-foreground/70 md:text-[14px]")}>
          {label}
        </p>
        <h2
          id={`${id}-heading`}
          style={standardH2()}
          className={cn(FLUID_TYPE, DISPLAY_HEADING, "mt-4 max-w-[16ch] text-balance md:mt-5")}
        >
          {heading}
        </h2>
        <div className="mt-10 flex flex-col gap-20 md:mt-14 xl:gap-28">{children}</div>
      </Container>
    </section>
  );
}

/**
 * Text and its figure. From 1280px: two equal columns with a generous gap,
 * tops aligned, the figure on `figureSide` and sticky beneath the section bar
 * while the text scrolls. A `<SplitAfter>` child continues the text in the same column below
 * the introduction, with the figure spanning both, so a short introduction beside a
 * tall figure leaves no gap. Below 1280 everything stacks in DOM order:
 * the introduction, the figure, then the continuation, so the figure follows the text that
 * introduces it (and any instruction pointing to it reads "below").
 */
export function SplitRow({ figureSide, figure, children }: { figureSide: "left" | "right"; figure?: ReactNode; children: ReactNode }) {
  const left = figureSide === "left";
  const all = Children.toArray(children);
  const after = all.filter((c) => isValidElement(c) && c.type === SplitAfter);
  const lead = all.filter((c) => !(isValidElement(c) && c.type === SplitAfter));
  const textCol = left ? "xl:col-start-2" : "xl:col-start-1";
  return (
    <div
      data-slot="split-row"
      data-figure-side={figureSide}
      className="grid gap-12 md:gap-14 xl:grid-cols-2 xl:grid-rows-[auto_1fr] xl:gap-x-20 xl:gap-y-0"
    >
      <div data-slot="split-text" className={cn("min-w-0 xl:row-start-1", textCol)}>
        {lead}
      </div>
      {figure && (
        <div
          data-slot="split-figure"
          className={cn(
            "min-w-0 xl:sticky xl:top-40 xl:row-span-2 xl:row-start-1 xl:self-start",
            left ? "xl:col-start-1" : "xl:col-start-2",
          )}
        >
          {figure}
        </div>
      )}
      {after.length > 0 && (
        <div data-slot="split-text" className={cn("min-w-0 xl:row-start-2 xl:pt-16", textCol)}>
          {after}
        </div>
      )}
    </div>
  );
}

/** Marks the text that continues below a SplitRow's introduction (see SplitRow). */
export function SplitAfter({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Running text at the reading measure. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(MEASURE, BODY_COPY, "mt-5 flex flex-col gap-5 first:mt-0", className)}>{children}</div>;
}

/** A subsection heading inside a section. */
export function Subhead({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h3
      id={id}
      className={cn(MEASURE, "mt-16 mb-5 first:mt-0 text-[24px] leading-[30px] font-semibold tracking-[-0.4px] text-foreground md:mt-20 md:text-[28px] md:leading-[34px]", className)}
    >
      {children}
    </h3>
  );
}

/**
 * A figure: a rounded frame (label at its top, so the frame aligns with the text beside it) with the grayscale tie-dye fill and
 * generous padding, caption below. Inside the frame the palette is always the
 * light one (`.science-light`), whatever the section's fill.
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
  /** Short label shown above the frame ("Figure 1 · Incline geometry"). */
  label?: string;
}) {
  return (
    <figure data-slot="science-figure" className={cn("min-w-0", className)}>
      <div
        data-slot="figure-frame"
        style={grayTintVars}
        className="science-light relative isolate overflow-hidden rounded-2xl bg-(--tie-wash) p-5 text-foreground sm:p-8 md:p-10"
      >
        <span aria-hidden className="cmr-tie-dye absolute -z-10" />
        {label && <p className={cn(EYEBROW, "mb-6 text-[12px] leading-5 text-foreground/70 md:mb-8 md:text-[13px]")}>{label}</p>}
        {children}
      </div>
      {caption && <figcaption className={cn(MEASURE, "mt-4 text-p-sm text-muted-foreground")}>{caption}</figcaption>}
    </figure>
  );
}

/**
 * The understated "how to use it" line after the text that introduces an
 * interactive figure. The direction is true at every width: "to the right" /
 * "to the left" where the figure sits beside the text (from 1280px), "below"
 * where it stacks. Only the visible variant is in the accessibility tree.
 */
export function Instruction({ figureSide, before, after }: { figureSide: "left" | "right"; before: string; after: string }) {
  return (
    <p data-slot="figure-instruction" className={cn(MEASURE, "mt-6 text-p-sm text-muted-foreground")}>
      {before}{" "}
      {/* Literal class names (Tailwind scans source text); keep in step with SPLIT. */}
      <span className="xl:hidden">figure below</span>
      <span className="hidden xl:inline">figure to the {figureSide}</span> {after}
    </p>
  );
}

/** A definition-style list of short labelled points (not cards). */
export function TermList({ items, className }: { items: [ReactNode, ReactNode][]; className?: string }) {
  return (
    <dl className={cn(MEASURE, "border-b border-foreground/20", className)}>
      {items.map(([term, detail], i) => (
        <div key={i} className="grid gap-1 border-t border-foreground/20 py-5 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">
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
    <span data-slot="cite" className="text-[0.8em] whitespace-nowrap text-foreground/75">
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
              className="rounded-xs text-foreground underline decoration-foreground/40 underline-offset-2 outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring"
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
