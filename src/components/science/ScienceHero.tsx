import { Container } from "@/components/Container";
import { HillHeroBackground, seedFor } from "@/components/hills/HillHero";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * 01 · Hero. The black hill-hero background (HillHeroBackground: the same
 * animated contour field as the individual hill pages, with its reduced-motion
 * and Pause motion behaviour), under a black wash from the left (vertical on
 * phones and tablets) so the copy reads on near-solid black.
 *
 * Headline (Owner direction, 2026-11-09): "The science behind hill repeats?",
 * as written, wrapping naturally (balanced, no fixed breaks). Subtitle and
 * intro are the Owner's approved text, verbatim. No eyebrow.
 */
export function ScienceHero() {
  const heading = fluidType([46, 84, 120], [44, 76, 108]);

  return (
    <section
      aria-labelledby="science-heading"
      data-slot="science-hero"
      className={cn("relative isolate overflow-hidden bg-primary text-primary-foreground", onDarkSurface)}
    >
      <HillHeroBackground seed={seedFor("the-science")} />
      <div className="absolute inset-0 -z-10">
        {/* Readability wash: vertical on phones and tablets (the copy spans the width), from the left from 1024px. */}
        <div
          aria-hidden
          data-slot="science-hero-wash"
          className={cn(
            "absolute inset-0",
            "bg-linear-to-b from-primary from-30% via-primary/75 via-60% to-primary/25",
            "lg:bg-linear-to-r lg:from-primary lg:from-45% lg:via-primary/85 lg:via-62% lg:to-primary/0 lg:to-95%",
          )}
        />
      </div>

      <Container className="pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-28 lg:pb-36">
        <h1
          id="science-heading"
          style={heading}
          className={cn(FLUID_TYPE, "max-w-[13ch] font-black tracking-[-0.045em] text-balance")}
        >
          The science behind hill repeats?
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
