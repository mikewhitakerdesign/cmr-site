import Image from "next/image";
import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { standardH2 } from "@/lib/headings";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * The founder's handwritten signature (Owner asset: transparent, white ink for
 * the black section, rotated to read horizontally). Decorative (alt=""): the
 * printed name directly below says the same.
 */
function Signature() {
  return (
    <Image
      src="/about/founder-signature.png"
      alt=""
      width={1058}
      height={436}
      sizes="240px"
      className="h-auto w-[180px] md:w-[240px]"
    />
  );
}

/**
 * "From mountains to molehills." — the extended full-width black founder
 * section (Figma About 02, 1:5433): the heading on the left and the story in a
 * generous right column from lg, stacked below. The top padding leaves room for
 * the hero circles that overlap this section. 
 */
export function FounderStory() {
  const layout = fluidVars({
    "--founder-py": [64, 96, 144],
    "--founder-pt": [104, 152, 200],
  });
  const heading = standardH2();
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
          <div style={body} className={cn(FLUID_TYPE, "max-w-[640px] space-y-6 font-normal text-primary-foreground/90")}>
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
          </div>
        </div>
      </Container>
    </section>
  );
}
