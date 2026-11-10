import Image from "next/image";
import { ArrowLink } from "@/components/ArrowLink";
import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidVars } from "@/lib/fluid";
import { BODY_TEXT_COLOR, DISPLAY_HEADING, standardH2 } from "@/lib/headings";
import { cn } from "@/lib/utils";

/**
 * "Hills on hills on hills." — one editorial 50/50 card (Owner mockup,
 * 2026-11-10): the Cricket Hill photograph on the left half, a gray panel with
 * the headline, one sentence and a link to /hills on the right. Stacks on
 * phones, photograph first. Same drop shadow as the site's map images, one
 * rounded outline. The caption sits outside the card, in the figure caption
 * style of The Science.
 */
export function HillsCard() {
  const layout = fluidVars({ "--card-py": [56, 72, 112] });

  return (
    <section
      aria-labelledby="about-hills-heading"
      style={layout}
      className="bg-background text-foreground py-(--card-py-a) md:py-(--card-py-b)"
    >
      <Container>
        <figure>
          <div
            data-slot="hills-card"
            className="grid overflow-hidden rounded-3xl shadow-[0_8px_14px_rgba(65,65,65,0.28)] md:grid-cols-2"
          >
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[400px]">
              <Image
                src="/about/cricket-hill-hardik-michael.jpg"
                alt="Hardik and Michael smiling in a frosty field at sunrise on Cricket Hill, the hill rising behind them."
                fill
                sizes="(min-width: 1400px) 652px, (min-width: 768px) 50vw, 100vw"
                className="object-cover object-[30%_60%] md:object-[50%_60%]"
              />
            </div>
            <div className="flex flex-col justify-center bg-border px-6 py-10 md:px-10 md:py-12 lg:px-16">
              <h2
                id="about-hills-heading"
                style={standardH2()}
                className={cn(FLUID_TYPE, DISPLAY_HEADING, "text-balance ss08")}
              >
                Hills on hills on hills.
              </h2>
              <p className={cn("mt-6 max-w-[480px] text-[16px] leading-6 font-medium md:text-[18px] md:leading-[27px]", BODY_TEXT_COLOR)}>
                Small hills. Repeated climbs. More elevation than you&apos;d expect. Explore the places we run around Chicago.
              </p>
              <ArrowLink href="/hills" className="mt-8 text-p">
                Explore the hills
              </ArrowLink>
            </div>
          </div>
          <figcaption className="mt-4 max-w-[680px] text-p-sm text-muted-foreground">
            Hardik and Michael carving a path on Cricket Hill
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
