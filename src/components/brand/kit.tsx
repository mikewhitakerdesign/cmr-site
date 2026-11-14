import type { ReactNode } from "react";
import { Container } from "@/components/Container";
import { EYEBROW } from "@/components/hills/styles";
import { BODY, LABEL, SMALL } from "@/components/brand/styles";
import { MANUAL_ADDRESS, type BrandPlate, type PlateTone } from "@/lib/brand/manual";
import { FLUID_TYPE } from "@/lib/fluid";
import { DISPLAY_HEADING, standardH2 } from "@/lib/headings";
import { cn } from "@/lib/utils";

/**
 * Building blocks of the Brand Standards (/brand). Server Components.
 *
 * Everything is composed from the site's own tokens and type roles (Geist Black
 * headings, Geist Mono labels, hairline rules, black and white surfaces), so
 * the manual looks like CMR because it is made of CMR.
 *
 * Print: the same blocks render inside `.brand-print` (src/app/brand/print),
 * where one plate is one fixed-size page. Print-only adjustments use the
 * `[.brand-print_&]:` variant; nothing is duplicated for the PDF.
 */

const TONE: Record<PlateTone, string> = {
  light: "bg-background",
  // Inverts every token inside it (src/styles/cmr.css), exactly as The Science's black sections do.
  dark: "science-dark bg-background",
  muted: "bg-muted [--focus-offset:var(--muted)]",
};

/** The heading block shared by the web plate and the print page. */
function PlateHeading({ plate, number }: { plate: BrandPlate; number: string }) {
  return (
    <header className="grid gap-x-12 gap-y-6 lg:grid-cols-12 [.brand-print_&]:gap-y-0">
      <div className="lg:col-span-7">
        <p className={cn(EYEBROW, "text-[13px] text-foreground/70 [.brand-print_&]:text-[11px]")}>{number}</p>
        <h2
          id={`${plate.id}-heading`}
          style={standardH2()}
          className={cn(
            FLUID_TYPE,
            DISPLAY_HEADING,
            "mt-4 max-w-[16ch] text-balance",
            // A page is smaller than a desktop viewport: one fixed size, so every plate title matches.
            "[.brand-print_&]:mt-3 [.brand-print_&]:text-[50px] [.brand-print_&]:leading-[48px]",
          )}
        >
          {plate.title}
        </h2>
      </div>
      {plate.lede && (
        <div className="lg:col-span-5 lg:pt-[37px] [.brand-print_&]:pt-[31px]">
          <p className={BODY}>{plate.lede}</p>
        </div>
      )}
    </header>
  );
}

/** A plate on the website: a full-width section with its anchor. */
export function WebPlate({ plate, number }: { plate: BrandPlate; number: string }) {
  return (
    <section
      id={plate.id}
      aria-labelledby={`${plate.id}-heading`}
      data-slot="brand-plate"
      data-tone={plate.tone ?? "light"}
      className={cn(
        "border-t border-foreground/15 py-16 text-foreground md:py-24 lg:py-28",
        TONE[plate.tone ?? "light"],
        // A jump lands on the eyebrow, not on the empty padding above it (scroll-padding adds the clearance).
        "-scroll-mt-8 md:-scroll-mt-14 lg:-scroll-mt-16",
      )}
    >
      <Container>
        <PlateHeading plate={plate} number={number} />
        <div className="mt-10 md:mt-14">{plate.render()}</div>
      </Container>
    </section>
  );
}

/** A plate in the PDF: one page, with a running head and a folio. */
export function PrintPlate({ plate, number, chapter, page }: { plate: BrandPlate; number: string; chapter: string; page: number }) {
  return (
    <PrintPage tone={plate.tone} page={page} running={chapter} label={`${number} ${plate.title}`}>
      <PlateHeading plate={plate} number={number} />
      <div data-slot="brand-page-body" className="mt-8 flex min-h-0 flex-1 flex-col">
        {plate.render()}
      </div>
    </PrintPage>
  );
}

/** One fixed-size PDF page. Dimensions come from src/styles/brand.css (`--page-w`, `--page-h`). */
export function PrintPage({
  children,
  tone = "light",
  page,
  running,
  label,
  bleed = false,
  className,
}: {
  children: ReactNode;
  tone?: PlateTone;
  page: number;
  /** Running head, left. Omitted on the cover. */
  running?: string;
  /** Accessible name of the page region. */
  label: string;
  /** No margins, running head or folio: the page is one composition (cover, chapter openers). */
  bleed?: boolean;
  className?: string;
}) {
  return (
    <section data-slot="brand-page" data-page={page} data-tone={tone} data-bleed={bleed || undefined} aria-label={label} className={cn("brand-page text-foreground", TONE[tone], className)}>
      {bleed ? (
        children
      ) : (
        <>
          <p className={cn(LABEL, "flex justify-between text-[11px] text-foreground/60")}>
            <span>CMR Brand Standards</span>
            <span>{running}</span>
          </p>
          <div data-slot="brand-page-content" className="mt-9 mb-6 flex min-h-0 flex-1 flex-col">
            {children}
          </div>
          <p className={cn(LABEL, "flex justify-between text-[11px] text-foreground/60")}>
            <span>{MANUAL_ADDRESS}</span>
            <span data-slot="brand-folio">{String(page).padStart(2, "0")}</span>
          </p>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Content blocks                                                      */
/* ------------------------------------------------------------------ */

/** A framed stage for artwork. `ground` picks the surface the example sits on. */
export function Frame({
  children,
  ground = "white",
  className,
  label,
}: {
  children: ReactNode;
  ground?: "white" | "black" | "muted" | "none";
  className?: string;
  /** A mono caption in the frame's top-left corner. */
  label?: ReactNode;
}) {
  return (
    <div
      data-slot="brand-frame"
      className={cn(
        "relative isolate overflow-hidden rounded-xl",
        ground === "white" && "border border-foreground/15 bg-background text-foreground",
        ground === "black" && "science-dark bg-background text-foreground",
        ground === "muted" && "bg-muted text-foreground",
        className,
      )}
    >
      {label && <p className={cn(LABEL, "absolute top-4 left-4 z-10 text-[11px] text-foreground/60")}>{label}</p>}
      {children}
    </div>
  );
}

/** A figure with a caption in The Science's caption style. */
export function Figure({ children, caption, className }: { children: ReactNode; caption?: ReactNode; className?: string }) {
  return (
    <figure className={className}>
      {children}
      {caption && <figcaption className="mt-3 max-w-[680px] text-p-sm text-muted-foreground [.brand-print_&]:mt-2 [.brand-print_&]:text-[13px] [.brand-print_&]:leading-[18px]">{caption}</figcaption>}
    </figure>
  );
}

/** Label and value rows, in the hill pages' "Know what you're running" style. */
export function SpecList({ rows, className }: { rows: readonly (readonly [ReactNode, ReactNode])[]; className?: string }) {
  return (
    <dl className={cn("border-t border-foreground/20", className)}>
      {rows.map(([k, v], i) => (
        <div key={i} className="flex items-baseline justify-between gap-6 border-b border-foreground/20 py-3 [.brand-print_&]:py-2">
          <dt className={cn(LABEL, "shrink-0 text-foreground/65")}>{k}</dt>
          <dd className="text-right text-p-sm font-medium [.brand-print_&]:text-[13px] [.brand-print_&]:leading-[18px]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A real table for multi-column specifications. Scrolls sideways on phones; the page never does. */
export function SpecTable({
  caption,
  head,
  rows,
  className,
  mono = [],
}: {
  /** Read by assistive technology; shown visually only if `showCaption`. */
  caption: string;
  head: readonly ReactNode[];
  rows: readonly (readonly ReactNode[])[];
  className?: string;
  /** Column indexes set in Geist Mono (values, code, measurements). */
  mono?: readonly number[];
}) {
  return (
    <div
      data-slot="brand-table"
      // Focusable so keyboard users can scroll a wide table (WCAG 2.1.1); labelled by its caption.
      tabIndex={0}
      role="group"
      aria-label={caption}
      className={cn("overflow-x-auto rounded-xs outline-none focus-visible:ring-3 focus-visible:ring-ring [.brand-print_&]:overflow-visible", className)}
    >
      <table className="w-full min-w-[560px] border-collapse text-left [.brand-print_&]:min-w-0">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-foreground">
            {head.map((h, i) => (
              <th key={i} scope="col" className={cn(LABEL, "py-3 pr-6 font-normal text-foreground/65 last:pr-0 [.brand-print_&]:py-2")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-foreground/20">
              {row.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="py-3 pr-6 align-top text-p-sm font-semibold [.brand-print_&]:py-[7px] [.brand-print_&]:text-[13px] [.brand-print_&]:leading-[18px]">
                    {cell}
                  </th>
                ) : (
                  <td
                    key={i}
                    className={cn(
                      "py-3 pr-6 align-top text-p-sm text-foreground/80 last:pr-0 [.brand-print_&]:py-[7px] [.brand-print_&]:text-[13px] [.brand-print_&]:leading-[18px]",
                      mono.includes(i) && "font-mono text-[13px] [.brand-print_&]:text-[12px]",
                    )}
                  >
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A short rule or principle: bold line, one supporting sentence. */
export function Rule({ title, children, className }: { title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("border-t border-foreground pt-4", className)}>
      <h3 className="text-[20px] leading-6 font-black tracking-[-0.02em] [.brand-print_&]:text-[18px] [.brand-print_&]:leading-[22px]">{title}</h3>
      {children && <p className={cn(SMALL, "mt-2")}>{children}</p>}
    </div>
  );
}

/** A grid of rules. */
export function Rules({ children, columns = 3, className }: { children: ReactNode; columns?: 2 | 3 | 4; className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-x-8 gap-y-8 [.brand-print_&]:gap-y-6",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "md:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Correct and incorrect use, side by side. An incorrect example is struck
 * through, the way CMR corrects itself in copy (Chicago ~~Hills~~ Mountains).
 */
export function Usage({
  kind,
  children,
  caption,
  ground = "white",
  className,
  stageClassName,
  fill = false,
}: {
  kind: "do" | "dont";
  children: ReactNode;
  caption: ReactNode;
  ground?: "white" | "black" | "muted";
  className?: string;
  stageClassName?: string;
  /** In the PDF, the stage takes the height of its grid row instead of a fixed proportion. */
  fill?: boolean;
}) {
  return (
    <figure data-usage={kind} className={cn(fill && "[.brand-print_&]:flex [.brand-print_&]:min-h-0 [.brand-print_&]:flex-col", className)}>
      <Frame
        ground={ground}
        className={cn("flex aspect-[4/3] items-center justify-center p-6", fill && "[.brand-print_&]:aspect-auto [.brand-print_&]:min-h-0 [.brand-print_&]:flex-1", stageClassName)}
      >
        {children}
        {kind === "dont" && (
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full text-foreground">
            <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        )}
      </Frame>
      <figcaption className="mt-3 flex items-baseline gap-2 text-p-sm [.brand-print_&]:mt-2 [.brand-print_&]:text-[13px] [.brand-print_&]:leading-[18px]">
        <span className={cn(LABEL, "shrink-0 text-[11px]", kind === "dont" && "line-through")}>{kind === "do" ? "Do" : "Don't"}</span>
        <span className="text-foreground/75">{caption}</span>
      </figcaption>
    </figure>
  );
}
