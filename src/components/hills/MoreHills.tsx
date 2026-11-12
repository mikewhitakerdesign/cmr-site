import Link from "next/link";
import { ArrowLink } from "@/components/ArrowLink";
import { Container } from "@/components/Container";
import { ArrowUpRightIcon } from "@/components/icons";
import { SECTION_HEADING, sectionHeading } from "@/components/hills/styles";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import type { HillWithPage } from "@/lib/hills";
import { cn } from "@/lib/utils";

/**
 * "More hills worth while." — the way on from a hill page to the others
 * (refinement pass, Owner direction 2026-11-08). A simpler list than the
 * directory: no numbers, drawings, rise, surface or weekly-run columns — just
 * the names, set large like the homepage hill rows (28 / 32 / 64), each with
 * its park · neighborhood and a ↗.
 *
 * Interaction: the whole row is the link (stretched ::after on the name). It
 * matches the homepage "Get high in the city." list exactly: hover greys the
 * row (bg-border, 150ms colour transition), underlines the name and nudges the
 * ↗; keyboard focus rings the row. Motion is off under reduced motion.
 */
export function MoreHills({ hills }: { hills: HillWithPage[] }) {
  const name = fluidType([28, 32, 64], [36, 36, 60.8]);

  return (
    <section aria-labelledby="more-heading" className="border-t border-foreground py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-10 md:pb-14">
          <h2 id="more-heading" style={sectionHeading()} className={cn(FLUID_TYPE, SECTION_HEADING)}>
            More hills worth while.
          </h2>
          <ArrowLink href="/hills" className="text-p">
            All hills
          </ArrowLink>
        </div>

        <ul className="border-b border-foreground">
          {hills.map((hill) => (
            <li
              key={hill.slug}
              data-hill={hill.slug}
              className={cn(
                "group/hill relative border-t border-foreground hover:bg-border",
                "motion-safe:transition-colors motion-safe:duration-150",
              )}
            >
              <div className="flex items-center gap-4 py-6 md:py-7 lg:py-8">
                <div className="min-w-0 flex-1 lg:flex lg:items-baseline lg:justify-between lg:gap-8">
                  <h3 style={name} className={cn(FLUID_TYPE, "font-semibold tracking-[-0.03em]")}>
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
                  </h3>
                  <p className="mt-1 text-[13px] leading-5 lg:mt-0 lg:text-p-sm">{hill.neighborhood}</p>
                </div>
                <ArrowUpRightIcon
                  className={cn(
                    "size-5 shrink-0 lg:size-6",
                    "motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover/hill:translate-x-0.5 motion-safe:group-hover/hill:-translate-y-0.5",
                  )}
                />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
