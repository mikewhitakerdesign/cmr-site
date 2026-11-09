import Link from "next/link";
import { Fragment } from "react";
import { Container } from "@/components/Container";
import { ContourField } from "@/components/ContourField";
import { TopoPattern } from "@/components/home/TopoPattern";
import { EYEBROW } from "@/components/hills/styles";
import { fluidType, fluidVars } from "@/lib/fluid";
import type { HillWithPage } from "@/lib/hills";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/** A stable per-hill seed, so each hill gets its own terrain in the background. */
const seedFor = (slug: string) => [...slug].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 997, 7) / 13;

/**
 * Hill hero — Figma "Hero / Cricket Hill original photo" 1:6673 (desktop),
 * 1:7007 (tablet), 1:7336 (mobile), for its height (540 / 697 / 844 below the
 * sticky header) and its bottom-anchored display name.
 *
 * Chicago Hills refinement pass (Owner direction, 2026-11-08), the same for
 * all five hills:
 *   - background: slow animated contour lines in grey on black (ContourField,
 *     `--cmr-contour-on-dark`), seeded per hill; one still frame under reduced
 *     motion; the static pattern without WebGL2. Replaces the photograph and
 *     the static pattern.
 *   - no eyebrow; the name larger (60 / 104 / 176, was 48 / 73 / 144) and on
 *     two lines, one word per line ("WARREN / HILL", "MT. / TRASHMORE"); on
 *     phones capped to the column so "TRASHMORE" never clips (≈ 54px at 393)
 *   - the breadcrumb moves below the hero (HillBreadcrumb)
 *
 * Legibility: white type over black, crossing at most a hairline of #525252
 * (7.8:1 at worst).
 */
export function HillHero({ hill }: { hill: HillWithPage }) {
  const layout = fluidVars({ "--hero-h": [540, 697, 844] });
  // Line height 0.9 at every size, so the mobile cap below scales it too.
  const heading = fluidType([60, 104, 176], [54, 93.6, 158.4]);

  return (
    <section
      aria-labelledby="hill-heading"
      style={layout}
      className={cn(
        "relative isolate flex flex-col bg-primary text-primary-foreground",
        "min-h-(--hero-h-a) md:min-h-(--hero-h-b)",
        onDarkSurface,
      )}
    >
      <div className="absolute inset-0 -z-10">
        <ContourField
          className="bg-primary text-(--cmr-contour-on-dark)"
          seed={seedFor(hill.slug)}
          fallback={<TopoPattern className="text-(--cmr-contour-on-dark)" />}
        />
      </div>

      <Container className="mt-auto pt-24 pb-14 md:pb-16 lg:pb-20">
        <h1
          id="hill-heading"
          style={heading}
          className={cn(
            // Below tablet, never wider than the column: the longest word ("TRASHMORE") is ≈ 6.2em.
            "text-[min(var(--fs-a),calc((100vw-48px)/6.4))] leading-[0.9] md:text-(length:--fs-b)",
            "font-black tracking-[-0.045em] uppercase",
          )}
        >
          {/* One word per line; the spaces stay in the text so the name reads "Warren Hill". */}
          {hill.name.split(" ").map((word, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className="block">{word}</span>
            </Fragment>
          ))}
        </h1>
      </Container>
    </section>
  );
}

/**
 * Breadcrumb back to the directory — added in the milestone (not in Figma) and
 * moved below the hero in the refinement pass (Owner direction, 2026-11-08).
 * Geist Mono, quiet (75% black: small mono type needs more than the 4.7:1 of
 * muted-foreground to measure ≥ 4.5:1 once anti-aliased), on a hairline rule.
 */
export function HillBreadcrumb({ hill }: { hill: HillWithPage }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-border">
      <Container>
        <ol className={cn(EYEBROW, "flex flex-wrap gap-x-2 py-4 text-[12px] leading-5 text-foreground/75 md:py-5 md:text-[13px]")}>
          <li>
            <Link
              href="/hills"
              className="rounded-xs text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
            >
              Chicago Mountains
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page">{hill.name}</li>
        </ol>
      </Container>
    </nav>
  );
}
