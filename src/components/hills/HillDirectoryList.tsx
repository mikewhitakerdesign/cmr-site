import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { DirectoryHoverField } from "@/components/hills/DirectoryHoverField";
import { EYEBROW } from "@/components/hills/styles";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import type { DirectoryEntry } from "@/lib/hill-directory";
import type { HillWithPage } from "@/lib/hills";
import { cn } from "@/lib/utils";

/** "≈ 30 ft", or what to say instead when there is no measured figure. */
export function riseLabel(hill: HillWithPage): string {
  const figures = hill.profile && !hill.profile.interpretive ? hill.profile.figures : null;
  return figures ? `≈ ${figures.riseFt} ft` : "Not measured";
}

/** Desktop columns: hill | rise | surface | weekly with CMR | ↗ (header row and rows share them). */
const DESKTOP_COLS = "lg:grid-cols-[minmax(0,5fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,3fr)_24px] lg:gap-x-10";

/**
 * The hill directory list — /hills.
 *
 * No Figma frame exists for the Hills directory. This extends the approved
 * homepage hill list ("Get high in the city." rows, 1:118: rows on black
 * rules, name in Geist semibold, park · neighborhood, ↗) with what the IA asks
 * the directory to make comparable: the approximate rise, the surface and
 * when CMR runs it each week.
 *
 *   mobile / tablet   name, place; facts in a row below
 *   desktop           one row: hill | rise | surface | weekly with CMR | ↗,
 *                     on shared columns (labels in a header row; per-row
 *                     labels visually hidden)
 *
 * Refinement pass (Owner direction, 2026-11-08): no row numbers; Surface is
 * the Owner's "Grass/dirt" for every hill; "With CMR" became "Weekly with
 * CMR" (weekly runs only), and a hill without one reads "No set weekly run".
 *
 * Final pass (Owner direction, 2026-11-09): the drawing thumbnail is gone and
 * the columns are rebalanced around the name; hover (and keyboard focus) shows
 * a faint moving contour fill instead of the grey row: one shared WebGL layer
 * behind the list, revealed through the active row (DirectoryHoverField).
 * Content status stays on each row as `data-status`.
 *
 * The name is the row's only link; a stretched ::after makes the whole row
 * clickable without nesting interactive content. Hover also underlines the
 * name and nudges the ↗; keyboard focus rings the whole row.
 */
export function HillDirectoryList({
  entries,
  headingLevel = "h2",
  className,
}: {
  entries: DirectoryEntry[];
  /** Level of each row's name heading. */
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const name = fluidType([28, 32, 48], [32, 36, 48]);
  const Name = headingLevel;

  return (
    <div className={className}>
      <div aria-hidden className={cn(EYEBROW, "hidden pb-3 text-[12px] leading-5 text-muted-foreground lg:grid", DESKTOP_COLS)}>
        <span>Hill</span>
        <span>Rise</span>
        <span>Surface</span>
        <span>Weekly with CMR</span>
      </div>

      <div className="relative isolate">
        <DirectoryHoverField />
        <ol className="border-b border-foreground">
          {entries.map(({ hill, cadences }) => (
            <li
              key={hill.slug}
              data-hill={hill.slug}
              data-status={hill.status}
              className={cn("group/hill relative border-t border-foreground py-6 md:py-7", "lg:grid lg:items-center", DESKTOP_COLS)}
            >
              <div>
                <Name style={name} className={cn(FLUID_TYPE, "font-semibold tracking-[-0.03em]")}>
                  <Link
                    href={`/hills/${hill.slug}`}
                    className={cn(
                      "outline-none underline-offset-[0.12em] decoration-[0.04em] group-hover/hill:underline",
                      "after:absolute after:inset-0 after:z-10 after:content-['']",
                      "focus-visible:after:ring-3 focus-visible:after:ring-ring",
                    )}
                  >
                    {hill.name}
                  </Link>
                </Name>
                <p className="mt-1 text-[13px] leading-5 lg:text-p-sm">{hill.neighborhood}</p>
              </div>

              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 lg:contents">
                <Fact label="Rise">{riseLabel(hill)}</Fact>
                <Fact label="Surface">{hill.page.surfaceSummary}</Fact>
                <Fact label="Weekly with CMR">
                  {cadences.length > 0 ? cadences.map((c) => <span key={c} className="block">{c}</span>) : "No set weekly run"}
                </Fact>
              </dl>

              <ArrowUpRightIcon
                className={cn(
                  "hidden size-5 shrink-0 justify-self-end lg:block",
                  "motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover/hill:translate-x-0.5 motion-safe:group-hover/hill:-translate-y-0.5",
                )}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className={cn(EYEBROW, "text-[11px] leading-4 text-muted-foreground lg:sr-only")}>{label}</dt>
      <dd className="mt-0.5 text-p-sm font-semibold lg:mt-0">{children}</dd>
    </div>
  );
}
