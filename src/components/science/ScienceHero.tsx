import { Container } from "@/components/Container";
import { EYEBROW } from "@/components/hills/styles";
import { TerrainLines } from "@/components/science/TerrainLines";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * 01 · Hero. Black, with the slow terrain-line background (TerrainLines) in
 * light gray. A black gradient sits over the left side so the copy reads on
 * near-solid black while the terrain shows toward the right; on phones, where
 * the copy spans the width, the wash is vertical and stronger at the top.
 *
 * Copy is the Owner's approved hero text, verbatim. Left-aligned, white type,
 * the CMR display weight and tracking (Join and hill heroes).
 */
export function ScienceHero() {
  const heading = fluidType([46, 84, 120], [44, 76, 108]);

  return (
    <section
      aria-labelledby="science-heading"
      data-slot="science-hero"
      className={cn("relative isolate overflow-hidden bg-primary text-primary-foreground", onDarkSurface)}
    >
      <div className="absolute inset-0 -z-10">
        <TerrainLines className="text-primary-foreground" />
        {/* Readability wash: vertical on phones, from the left from tablet up. */}
        <div
          aria-hidden
          data-slot="science-hero-wash"
          className={cn(
            "absolute inset-0",
            "bg-linear-to-b from-primary from-30% via-primary/75 via-60% to-primary/25",
            "md:bg-linear-to-r md:from-primary md:from-30% md:via-primary/85 md:via-50% md:to-primary/0 md:to-90%",
            "lg:from-25% lg:via-45%",
          )}
        />
      </div>

      <Container className="pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-28 lg:pb-36">
        <p className={cn(EYEBROW, "text-primary-foreground/75")}>The Science</p>
        <h1
          id="science-heading"
          style={heading}
          className={cn(FLUID_TYPE, "mt-5 max-w-[11ch] font-black tracking-[-0.045em] text-balance md:mt-6")}
        >
          THE SCIENCE OF GOING NOWHERE.
        </h1>
        <p className="mt-6 max-w-[30ch] text-[22px] leading-[1.25] font-semibold tracking-[-0.4px] text-balance md:mt-8 md:max-w-[34ch] md:text-[28px] lg:text-[32px]">
          The surprisingly legitimate benefits of running uphill. Repeatedly. In Chicago.
        </p>
        <div className="mt-8 flex max-w-[54ch] flex-col gap-4 text-[18px] leading-[28px] text-primary-foreground/80 md:mt-10">
          <p>
            Chicago is not known for its mountains. Or its hills, really. Yet here we are, voluntarily running up and down
            the same modest incline, sometimes for hours.
          </p>
          <p>
            As it turns out, there&apos;s quite a bit of science behind this behavior. The physiological benefits are real.
            The psychological motivations are a little more complicated.
          </p>
          <p>Let&apos;s examine the evidence.</p>
        </div>
      </Container>
    </section>
  );
}
