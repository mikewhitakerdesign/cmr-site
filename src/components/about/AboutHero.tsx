import { HeroCircles } from "@/components/about/HeroCircles";
import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidVars } from "@/lib/fluid";
import { BODY_TEXT_COLOR, pageH1 } from "@/lib/headings";
import { cn } from "@/lib/utils";

/**
 * About hero — Figma About / Desktop 1:5598 (headline, intro copy), tablet
 * 1:5619 and mobile 1:5815. The four circles (Owner copy, 2026-11-10) sit in one
 * row beneath the text and overlap the black founder section (HeroCircles).
 */
const CIRCLES = [
  "Show up, run the hill, repeat.",
  "Totally Free. No Fees.",
  "Any pace, everybody welcome.",
  "First-timers to ultra-marathoners.",
];

export function AboutHero() {
  const layout = fluidVars({
    "--about-pt": [56, 64, 80],
    "--about-copy-mt": [28, 32, 40],
  });
  const heading = pageH1();

  return (
    <section
      aria-labelledby="about-heading"
      style={layout}
      className="relative z-10 bg-background text-foreground pt-(--about-pt-a) md:pt-(--about-pt-b)"
    >
      <Container>
        <h1
          id="about-heading"
          style={heading}
          className={cn(FLUID_TYPE, "max-w-[9.6em] font-black tracking-[-0.04em] text-balance ss08 xl:max-w-[8.6em]")}
        >
          A running group hunting elevation where there shouldn’t be any.
        </h1>
        <p className={cn("mt-(--about-copy-mt-a) max-w-[560px] text-[18px] leading-[27px] font-normal md:mt-(--about-copy-mt-b)", BODY_TEXT_COLOR)}>
          Chicago Mountain Runners is an independent, open running group built around a simple idea: the city is flat,
          so we make our own mountains. We meet at local (trash) hills, sledding slopes and overlooked pieces of
          elevation and run them until they add up to something.
        </p>

        <HeroCircles circles={CIRCLES} />
      </Container>
    </section>
  );
}
