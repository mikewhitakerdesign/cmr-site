import { Container } from "@/components/Container";
import { WeatherPanel } from "@/components/weather/WeatherPanel";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { BODY_TEXT_COLOR } from "@/lib/headings";
import { cn } from "@/lib/utils";

/**
 * Find a Run hero (Figma Find a Run / Month, 1:1287 and siblings). The Figma
 * eyebrow is removed (Owner direction); the headline is larger, black on
 * white, and the weather module sits beside it from `lg` and below it on
 * smaller screens. The calendar's browsing date never changes the weather,
 * which is always today's.
 */
export function FindHero({ now }: { now: Date }) {
  const heading = fluidType([60, 96, 124], [54, 86, 112]);
  return (
    <section aria-labelledby="find-heading" className="pt-12 pb-14 md:pt-16 md:pb-20 lg:pb-24">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-end lg:gap-14">
        <div>
          <h1 id="find-heading" style={heading} className={cn(FLUID_TYPE, "font-black tracking-[-0.045em]")}>
            <span className="block">
              Pick a hill<span className="ss08">.</span>
            </span>{" "}
            <span className="block">
              Show up<span className="ss08">.</span>
            </span>
          </h1>
          <p className={cn("mt-6 max-w-[560px] text-[18px] leading-[27px] md:mt-8", BODY_TEXT_COLOR)}>
            Chicago isn&apos;t known for its mountains. We&apos;re working with what we&apos;ve got. Join us for weekly hill repeats,
            questionable amounts of vertical, and good company. All paces welcome. No registration. No excuses about the elevation.
          </p>
        </div>
        <WeatherPanel now={now} />
      </Container>
    </section>
  );
}
