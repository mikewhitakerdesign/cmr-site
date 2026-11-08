import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { EYEBROW, SECTION_HEADING, sectionHeading } from "@/components/hills/styles";
import { FLUID_TYPE } from "@/lib/fluid";
import type { HillWithPage } from "@/lib/hills";
import { workoutLabel, type RunOccurrence } from "@/lib/runs";
import { describeSchedule } from "@/lib/schedule";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

const CTA = "h-14 px-7 text-[18px] leading-[27px] font-medium";

/**
 * "Run it with us" — Figma 1:6551 (black band, padding 96): the run held at
 * this hill (title 36 → 64, schedule in Geist Mono 16/24 at 80%, workout
 * 18/27 at 80%) and "View run" / "Find a Run". Run and actions side by side
 * from tablet (bottom-aligned), stacked on mobile (gap 32).
 *
 * The Hill → Run half of the IA's bidirectional relationship. Data comes from
 * src/lib/runs.ts — the Figma sample ("Cricket Hill Repeats, Tuesday 6:00 AM")
 * is not used. Variation: several runs stack with a rule between them; a hill
 * with no CMR run says so and points to the calendar. Run status stays on the
 * row as `data-status` (no visible badge, matching the homepage run list).
 */
export function HillRuns({ hill, runs }: { hill: HillWithPage; runs: RunOccurrence[] }) {
  return (
    <section aria-labelledby="runs-heading" className={cn("bg-primary py-24 text-primary-foreground", onDarkSurface)}>
      <Container>
        <h2 id="runs-heading" className={EYEBROW}>
          Run it with us
        </h2>

        {runs.length > 0 ? (
          <ul>
            {runs.map((o, i) => {
              const workout = workoutLabel(o.run);
              return (
                <li
                  key={o.run.slug}
                  data-status={o.run.status}
                  className={cn(
                    "flex flex-col gap-8 pt-8 md:flex-row md:items-end md:justify-between",
                    i > 0 && "mt-10 border-t border-primary-foreground/30 pt-10",
                  )}
                >
                  <div className="max-w-[567px] min-w-0 md:flex-1">
                    <h3 style={sectionHeading()} className={cn(FLUID_TYPE, SECTION_HEADING)}>
                      {o.run.title}
                    </h3>
                    <p className="pt-4 font-mono text-[16px] leading-6 text-primary-foreground/80">
                      {describeSchedule(o.run.schedule)} · {o.meetupLocation}
                    </p>
                    {workout && <p className="pt-2 text-[18px] leading-[27px] text-primary-foreground/80">{workout}</p>}
                  </div>
                  <div className="flex flex-wrap gap-3 md:shrink-0 md:flex-nowrap">
                    {/* The name starts with the visible label (WCAG 2.5.3) and says which run. */}
                    <CtaLink href={`/calendar/${o.run.slug}`} variant="secondary" aria-label={`View run: ${o.run.title}`} className={CTA}>
                      View run
                    </CtaLink>
                    <CtaLink href="/calendar" variant="outlineOnDark" className={CTA}>
                      Find a Run
                    </CtaLink>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col gap-8 pt-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[567px] min-w-0 md:flex-1">
              <h3 style={sectionHeading()} className={cn(FLUID_TYPE, SECTION_HEADING)}>
                No group runs here yet.
              </h3>
              <p className="pt-4 text-[18px] leading-[27px] text-primary-foreground/80">
                {hill.name} isn&apos;t on the CMR calendar right now. See where we&apos;re climbing next.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:shrink-0 md:flex-nowrap">
              <CtaLink href="/calendar" variant="secondary" className={CTA}>
                Find a Run
              </CtaLink>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
