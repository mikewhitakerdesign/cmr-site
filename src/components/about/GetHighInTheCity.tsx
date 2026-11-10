import { ArrowLink } from "@/components/ArrowLink";
import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { cn } from "@/lib/utils";

/**
 * "Get high in the city." — the homepage hills heading and copy type, reduced
 * to one sentence and a link: the Chicago Hills directory (/hills) already
 * lists the hills, so the Figma five-row list is intentionally not repeated.
 */
export function GetHighInTheCity() {
  const layout = fluidVars({ "--hills-py": [56, 72, 112] });
  const heading = fluidType([48, 54, 96], [48, 54, 88]);
  const copy = fluidType([16, 16, 18], [24, 24, 27]);

  return (
    <section
      aria-labelledby="about-hills-heading"
      style={layout}
      className="bg-background text-foreground py-(--hills-py-a) md:py-(--hills-py-b)"
    >
      <Container>
        <h2 id="about-hills-heading" style={heading} className={cn(FLUID_TYPE, "font-black tracking-[-0.04em] ss08")}>
          Get high in the city.
        </h2>
        <p style={copy} className={cn(FLUID_TYPE, "mt-6 max-w-[560px] font-medium ss08")}>
          Small hills. Repeated climbs. More elevation than you&apos;d expect. Explore the places we run around Chicago.
        </p>
        <ArrowLink href="/hills" className="mt-8 text-p">
          Explore the hills
        </ArrowLink>
      </Container>
    </section>
  );
}
