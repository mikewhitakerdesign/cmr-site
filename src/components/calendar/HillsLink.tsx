import { ArrowLink } from "@/components/ArrowLink";
import { Container } from "@/components/Container";
import { TopoPattern } from "@/components/home/TopoPattern";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { DISPLAY_HEADING } from "@/lib/headings";
import { cn } from "@/lib/utils";

/**
 * A quiet pointer to Chicago Hills: one heading, one sentence, one link, over a
 * faint static contour field that fades in from the right. It does not repeat
 * the hill directory.
 */
export function HillsLink() {
  return (
    <section aria-labelledby="hills-link-heading" className="relative isolate overflow-hidden border-t border-foreground/15 py-20 md:py-28">
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-10 w-full opacity-60 md:w-[62%] [mask-image:linear-gradient(to_right,transparent,black_55%)]"
      >
        <TopoPattern className="text-(--cmr-contour-on-light)" />
      </div>
      <Container>
        <h2 id="hills-link-heading" style={fluidType([44, 56, 72], [44, 56, 68])} className={cn(FLUID_TYPE, DISPLAY_HEADING)}>
          Know your mountain<span className="ss08">.</span>
        </h2>
        <p className="mt-5 max-w-[480px] text-[18px] leading-[27px] text-foreground/70">
          Calling them mountains is generous. That doesn&apos;t mean they aren&apos;t worth climbing.
        </p>
        <ArrowLink href="/hills" className="mt-8 text-[18px] leading-[27px]">
          Explore Chicago hills
        </ArrowLink>
      </Container>
    </section>
  );
}
