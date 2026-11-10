import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { tintVars } from "@/lib/tie-dye";
import { cn } from "@/lib/utils";

/**
 * About hero — Figma About / Desktop 1:5598 (headline, intro copy, four grey
 * circles), tablet 1:5619 and mobile 1:5815 (Figma drew no circles there).
 *
 * The four circles keep the Figma copy and staggered, differently sized
 * composition but take the homepage club-totals tie-dye fills (tintVars +
 * `cmr-tie-dye`), one tint each. From xl they float to the right of the
 * headline and intro; below xl they reflow into a 2 × 2 grid under the copy,
 * with the second column stepped down for the same playful stagger.
 */
const CIRCLES: { text: string; size: number; left: number; top: number }[] = [
  { text: "Show up, climb, regroup, repeat.", size: 190, left: 150, top: 0 },
  { text: "Totally Free. No Fees.", size: 250, left: 10, top: 175 },
  { text: "Any Pace welcome. I’m slow AF.", size: 215, left: 215, top: 335 },
  { text: "First-timers to ultra marathoners all are welcome.", size: 275, left: 20, top: 485 },
];

export function AboutHero() {
  const layout = fluidVars({
    "--about-pt": [56, 64, 80],
    "--about-pb": [64, 80, 128],
    "--about-copy-mt": [28, 32, 40],
  });
  const heading = fluidType([44, 76, 100], [46, 78, 98]);
  const copy = fluidType([16, 18, 18], [24, 27, 27]);

  return (
    <section
      aria-labelledby="about-heading"
      style={layout}
      className="bg-background text-foreground pt-(--about-pt-a) pb-(--about-pb-a) md:pt-(--about-pt-b) md:pb-(--about-pb-b)"
    >
      <Container className="xl:relative xl:min-h-[760px]">
        <h1
          id="about-heading"
          style={heading}
          className={cn(FLUID_TYPE, "max-w-[9.6em] font-black tracking-[-0.04em] text-balance ss08 xl:max-w-[8.6em]")}
        >
          A running group hunting elevation where there shouldn’t be any.
        </h1>
        <p
          style={copy}
          className={cn(FLUID_TYPE, "mt-(--about-copy-mt-a) max-w-[587px] font-medium ss08 md:mt-(--about-copy-mt-b)")}
        >
          Chicago Mountain Runners is an independent, open running group built around a simple idea: the city is flat,
          so we make our own mountains. We meet at local (trash) hills, sledding slopes and overlooked pieces of
          elevation and run them until they add up to something.
        </p>

        <ul
          className={cn(
            "mt-12 grid max-w-[460px] grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-6 md:max-w-[560px]",
            "xl:absolute xl:top-4 xl:right-12 xl:mt-0 xl:block xl:h-[760px] xl:w-[440px] xl:max-w-none",
          )}
        >
          {CIRCLES.map((c, i) => (
            <li
              key={c.text}
              style={{ ...tintVars(i), "--size": `${c.size}px`, "--left": `${c.left}px`, "--top": `${c.top}px` } as React.CSSProperties}
              className={cn(
                "relative isolate flex aspect-square w-full items-center justify-center overflow-hidden rounded-full px-[14%] text-center",
                "text-[15px] leading-[1.15] font-extrabold text-balance sm:text-[19px] md:text-[22px]",
                i % 2 === 1 && "mt-6 md:mt-8 xl:mt-0",
                "xl:absolute xl:text-[22px] xl:leading-[1.1] xl:left-(--left) xl:top-(--top) xl:w-(--size)",
                i === 3 && "xl:text-[24px]",
              )}
            >
              <span aria-hidden className="cmr-tie-dye absolute -z-10" />
              {c.text}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
