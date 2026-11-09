import Link from "next/link";
import type { ReactNode } from "react";
import { HillProfile } from "@/components/HillProfile";
import { ArrowUpRightIcon } from "@/components/icons";
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

/**
 * The hill directory list — /hills.
 *
 * No Figma frame exists for the Hills directory. This extends the approved
 * homepage hill list ("Get high in the city." rows, 1:118: numbered rows on
 * black rules, name in Geist semibold, park · neighborhood, ↗, the #ececec
 * hover row) with what the IA asks the directory to make comparable: a
 * thumbnail of the approved terrain drawing, the approximate rise, the surface
 * and when CMR runs it.
 *
 *   mobile   name, place; drawing below; facts in a row
 *   tablet   drawing (200) | name, place, facts
 *   desktop  one row: drawing | name, place | rise | surface | weekly with CMR | ↗
 *            (column labels in a header row; per-row labels are visually hidden)
 *
 * Refinement pass (Owner direction, 2026-11-08): no row numbers; Surface is
 * the Owner's "Grass/dirt" for every hill; "With CMR" became "Weekly with
 * CMR" (weekly runs only), and a hill without one reads "No set weekly run".
 *
 * The name is the row's only link; a stretched ::after makes the whole row
 * clickable without nesting interactive content. Hover greys the row,
 * underlines the name and nudges the ↗; keyboard focus rings the whole row.
 * Server Component: no client JavaScript (the drawings are static here — the
 * homepage keeps the interactive preview).
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
      <div
        aria-hidden
        className={cn(
          EYEBROW,
          "hidden pb-3 text-[12px] leading-5 text-muted-foreground lg:grid",
          "lg:grid-cols-[220px_minmax(0,1fr)_110px_150px_190px_20px] lg:gap-x-8",
        )}
      >
        <span className="col-start-2">Hill</span>
        <span>Rise</span>
        <span>Surface</span>
        <span>Weekly with CMR</span>
      </div>

      <ol className="border-b border-foreground">
        {entries.map(({ hill, cadences }) => (
          <li
            key={hill.slug}
            data-hill={hill.slug}
            className={cn(
              "group/hill relative border-t border-foreground motion-safe:transition-colors motion-safe:duration-150 hover:bg-border",
              "grid grid-cols-1 py-6",
              "md:grid-cols-[200px_minmax(0,1fr)] md:gap-x-6",
              "lg:grid-cols-[220px_minmax(0,1fr)_110px_150px_190px_20px] lg:items-center lg:gap-x-8",
            )}
          >
            <div className="md:col-start-2 lg:row-start-1">
              <Name style={name} className={cn(FLUID_TYPE, "font-semibold tracking-[-0.03em]")}>
                <Link
                  href={`/hills/${hill.slug}`}
                  className={cn(
                    "outline-none underline-offset-[0.12em] decoration-[0.04em] group-hover/hill:underline",
                    // z-10: above the drawing (positioned, later in the DOM), so clicking it opens the hill too.
                    "after:absolute after:inset-0 after:z-10 after:content-['']",
                    "focus-visible:after:ring-3 focus-visible:after:ring-ring",
                  )}
                >
                  {hill.name}
                </Link>
              </Name>
              <p className="mt-1 text-[13px] leading-5 lg:text-p-sm">{hill.neighborhood}</p>
            </div>

            {hill.profile && (
              <HillProfile
                name={hill.name}
                profile={hill.profile}
                caption={false}
                annotated={false}
                className="mt-4 max-w-[260px] md:col-start-1 md:row-span-2 md:row-start-1 md:mt-0 lg:row-span-1"
              />
            )}

            <dl
              className={cn(
                "mt-4 flex flex-wrap gap-x-6 gap-y-3 md:col-start-2",
                "lg:contents",
              )}
            >
              <Fact label="Rise" className="lg:col-start-3">
                {riseLabel(hill)}
              </Fact>
              <Fact label="Surface" className="lg:col-start-4">
                {hill.page.surfaceSummary}
              </Fact>
              <Fact label="Weekly with CMR" className="lg:col-start-5">
                {cadences.length > 0 ? cadences.map((c) => <span key={c} className="block">{c}</span>) : "No set weekly run"}
              </Fact>
            </dl>

            <ArrowUpRightIcon
              className={cn(
                "hidden size-5 shrink-0 lg:col-start-6 lg:row-start-1 lg:block",
                "motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover/hill:translate-x-0.5 motion-safe:group-hover/hill:-translate-y-0.5",
              )}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

function Fact({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("lg:row-start-1", className)}>
      <dt className={cn(EYEBROW, "text-[11px] leading-4 text-muted-foreground lg:sr-only")}>{label}</dt>
      <dd className="mt-0.5 text-p-sm font-semibold lg:mt-0">{children}</dd>
    </div>
  );
}
