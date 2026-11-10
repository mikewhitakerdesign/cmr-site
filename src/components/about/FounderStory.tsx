import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * Temporary text signature (no handwriting font, no dependency): the founder's
 * name in the page's own type, oblique and light. Replace the <span> with an
 * approved signature asset (next/image, alt="") when one exists. Hidden from
 * assistive tech because the printed name directly below says the same.
 */
function Signature() {
  return (
    <span aria-hidden className="block text-[32px] leading-none font-light tracking-tight text-primary-foreground italic md:text-[40px]">
      Michael Whitaker
    </span>
  );
}

const EMAIL = "michael@whitaker.design";

/**
 * "From mountains to molehills." — the extended full-width black founder
 * section (Figma About 02, 1:5433): the heading on the left and the story in a
 * generous right column from lg, stacked below. The top padding leaves room for
 * the hero circles that overlap this section. Photographs live in Members.
 */
export function FounderStory() {
  const layout = fluidVars({
    "--founder-py": [64, 96, 144],
    "--founder-pt": [104, 152, 200],
  });
  const heading = fluidType([44, 60, 84], [46, 62, 82]);
  const body = fluidType([16, 18, 20], [26, 28, 31]);

  return (
    <section
      aria-labelledby="founder-heading"
      style={layout}
      className={cn("bg-primary text-primary-foreground pt-(--founder-pt-a) pb-(--founder-py-a) md:pt-(--founder-pt-b) md:pb-(--founder-py-b)", onDarkSurface)}
    >
      <Container className="grid items-start gap-8 md:gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <h2
          id="founder-heading"
          style={heading}
          className={cn(FLUID_TYPE, "font-black tracking-[-0.04em] text-balance ss08 lg:col-start-1 lg:row-start-1 lg:pt-6")}
        >
          From mountains to molehills.
        </h2>
        <div className="lg:col-start-2 lg:row-start-1 lg:pt-6">
          <div style={body} className={cn(FLUID_TYPE, "max-w-[640px] space-y-6 font-medium text-primary-foreground/90")}>
            <p>
              I&apos;ve spent a good part of my life finding ways to go uphill. It started with endurance sports and
              eventually led to ice climbing, mountaineering, and several years climbing in the Cascades and Canadian
              Rockies.
            </p>
            <p>
              After a few years away, a rather spontaneous six-hour race in January 2024, with temperatures around
              -20°F, introduced me to ultrarunning. Twelve ultras later, including a 100-mile trail race, I&apos;m still
              finding reasons to keep going.
            </p>
            <p>
              Training for mountain races while living in Chicago presents an obvious problem. So I started making the
              most of what we have: sledding hills, park inclines, and the occasional pile of dirt. Enough repeats, and
              a surprisingly small hill becomes a legitimate workout.
            </p>
            <p>
              Chicago Mountain Runners grew out of that idea. A running group for people who enjoy climbing, want to get
              better at it, or are simply curious about how far a little elevation can go.
            </p>
          </div>
          <div className="mt-10 text-[18px] leading-[27px] md:mt-12">
            <Signature />
            <p className="mt-3 font-bold">Michael Whitaker</p>
            <p className="text-primary-foreground/90">Founder &amp; Director</p>
            <p className="text-primary-foreground/90">Chicago Mountain Runners</p>
            <p className="mt-4">
              <span className="text-primary-foreground/90">Email: </span>
              <a
                href={`mailto:${EMAIL}`}
                className="rounded-xs font-medium underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring"
              >
                {EMAIL}
              </a>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
