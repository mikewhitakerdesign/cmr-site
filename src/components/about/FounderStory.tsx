import Image from "next/image";
import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

const EMAIL = "michael@whitaker.design";

/** Circular photo: different sizes per use, subtle shadow, hairline ring so it reads on black. */
const photo =
  "relative aspect-square overflow-hidden rounded-full shadow-[0_24px_48px_-12px_rgba(0,0,0,0.85)] ring-1 ring-white/15";

/**
 * "From mountains to molehills." — the extended full-width black founder
 * section (Figma About 02, 1:5433). Two authentic, unedited photographs are
 * cropped to circles of different sizes: the climbing photo toward the
 * upper-left, the ultramarathon photo lower and offset right, easing into the
 * next section. Below lg the story comes first and the circles follow as an
 * overlapping pair.
 */
export function FounderStory() {
  const layout = fluidVars({
    "--founder-py": [64, 96, 144],
  });
  const heading = fluidType([44, 60, 84], [46, 62, 82]);
  const body = fluidType([16, 18, 20], [26, 28, 31]);

  return (
    <section
      aria-labelledby="founder-heading"
      style={layout}
      className={cn("bg-primary text-primary-foreground py-(--founder-py-a) md:py-(--founder-py-b)", onDarkSurface)}
    >
      <Container className="grid items-start gap-14 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div className="relative order-2 mx-auto w-full max-w-[560px] pb-4 lg:order-1 lg:max-w-none lg:pb-0">
          <div className={cn(photo, "w-[68%] lg:w-[82%]")}>
            <Image
              src="/about/founder-climbing.jpg"
              alt="Michael Whitaker smiling in a blue helmet and green jacket, roped up on a snowy mountain ridge."
              fill
              sizes="(min-width: 1024px) 38vw, 70vw"
              className="object-cover object-[12%_40%]"
            />
          </div>
          <div className={cn(photo, "-mt-[14%] ml-auto w-[52%] lg:-mt-[8%] lg:mr-[2%] lg:w-[60%]")}>
            <Image
              src="/about/founder-ultra.jpg"
              alt="Michael Whitaker at a night ultramarathon aid station, smiling and holding a decorated storage bin that reads “We love you”."
              fill
              sizes="(min-width: 1024px) 30vw, 55vw"
              className="object-cover object-[50%_22%]"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:pt-6">
          <h2 id="founder-heading" style={heading} className={cn(FLUID_TYPE, "font-black tracking-[-0.04em] text-balance ss08")}>
            From mountains to molehills.
          </h2>
          <div style={body} className={cn(FLUID_TYPE, "mt-8 max-w-[640px] space-y-6 font-medium text-primary-foreground/90 md:mt-10")}>
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
            <p className="font-bold">Michael Whitaker</p>
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
