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
 * Headline (Owner direction, 2026-11-10): "The science / behind hill / repeats?",
 * on three lines from 1024px, balanced wrapping below. One supporting
 * paragraph (Owner's text, verbatim); no subtitle, no eyebrow.
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
          {/* Three lines from 1024px; natural, balanced wrapping below. The spaces stay in the text for the accessible name. */}
          <span className="lg:block">The science</span> <span className="lg:block">behind hill</span>{" "}
          <span className="lg:block">repeats?</span>
        </h1>
        <p className="mt-8 max-w-[560px] text-[18px] leading-[28px] text-primary-foreground/80 md:mt-10 md:text-[20px] md:leading-[30px]">
          Chicago isn&apos;t known for its hills, yet we spend hours running up and down them. Turns out there&apos;s real
          science behind the physical benefits, and some interesting psychology behind why we keep doing it.
        </p>
      </Container>
    </section>
  );
}
