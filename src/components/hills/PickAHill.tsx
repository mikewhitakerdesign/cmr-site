import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

const CTA = "h-14 px-7 text-[18px] leading-[27px] font-medium";

/**
 * Closing band for /hills (no Figma frame; composed from approved parts): the
 * black "Run it with us" band of Hill Details (1:6551) with the Find a Run
 * page's heading "Pick a hill. Show up." (1:1296), and the site's two CTAs —
 * "Find a Run" and "Join the club" (every Join CTA uses that label).
 */
export function PickAHill() {
  const heading = fluidType([36, 48, 64], [36, 50, 60.8]);

  return (
    <section aria-labelledby="pick-heading" className={cn("bg-primary py-24 text-primary-foreground", onDarkSurface)}>
      <Container className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[640px] min-w-0 md:flex-1">
          <h2 id="pick-heading" style={heading} className={cn(FLUID_TYPE, "font-black tracking-[-0.03em]")}>
            Pick a hill. Show up.
          </h2>
          <p className="pt-4 text-[18px] leading-[27px] text-primary-foreground/80">
            Hills are better with company. Find the next group run and come climb with us.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:shrink-0 md:flex-nowrap">
          <CtaLink href="/calendar" variant="secondary" className={CTA}>
            Find a Run
          </CtaLink>
          <CtaLink href="/join" variant="outlineOnDark" className={CTA}>
            Join the club
          </CtaLink>
        </div>
      </Container>
    </section>
  );
}
