import { Container } from "@/components/Container";
import { FLUID_TYPE } from "@/lib/fluid";
import { DISPLAY_HEADING, impactH2 } from "@/lib/headings";
import { BODY_TEXT_COLOR } from "@/lib/headings";
import { cn } from "@/lib/utils";

/**
 * "Bad weather. Good hills." (Owner copy, verbatim). Static guidance for
 * /calendar and every run page. It sets expectations and says to check for
 * schedule updates; it does not describe how or where updates are
 * communicated beyond what the site shows, and it never promises a
 * cancellation. Dangerous conditions are named as a reason to stay home.
 */
export function WeatherGuidance({ id = "weather-guidance", className }: { id?: string; className?: string }) {
  return (
    <section aria-labelledby={`${id}-heading`} className={cn("py-16 md:py-24", className)}>
      <Container className="grid gap-8 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
        <h2 id={`${id}-heading`} style={impactH2()} className={cn(FLUID_TYPE, DISPLAY_HEADING, "text-balance")}>
          Bad weather. Good hills<span className="ss08">.</span>
        </h2>
        <div className={cn("flex flex-col gap-5 text-[18px] leading-[27px]", BODY_TEXT_COLOR)}>
          <p>Rain, wind, snow, cold, heat. We&apos;re not particularly picky.</p>
          <p>
            Lightning, thunderstorms, tornado warnings, and other dangerous conditions are a different story. Stay safe and stay home.
          </p>
          <p>
            Know your limits, dress for the conditions, and participate at your own risk. Check for schedule updates before heading out.
          </p>
        </div>
      </Container>
    </section>
  );
}
