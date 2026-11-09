import { Container } from "@/components/Container";
import { ContourField } from "@/components/ContourField";
import { CtaLink } from "@/components/CtaLink";
import { TopoPattern } from "@/components/home/TopoPattern";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { BODY_TEXT_COLOR } from "@/lib/headings";
import { joinCta } from "@/lib/navigation";
import { PERMIT_HOLD_COPY } from "@/lib/permit-hold";
import { cn } from "@/lib/utils";

/**
 * The permit-pending notice that replaces the Find a Run calendar while
 * official group runs are on hold (see src/lib/permit-hold.ts).
 *
 * A static message, not an alert: nothing here changes while the visitor is on
 * the page, so no live region and no `role="alert"`. The ambient contour field
 * behind it is the same one the run and hill pages use; the panel over it is a
 * restrained translucent surface (page background at 78% with a light blur) so
 * the text always sits on a near-white ground (≥ 12:1 against the lines).
 *
 * No agency name, logo or application status is shown or implied.
 */
export function PermitHold() {
  const heading = fluidType([40, 64, 96], [40, 62, 90]);
  return (
    <section aria-labelledby="permit-hold-heading" data-slot="permit-hold" className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <ContourField className="bg-background text-(--cmr-contour-on-light)" scale={480} levels={10} seed={11} speed={0.025} fallback={<TopoPattern />} />
      </div>
      <Container className="py-14 md:py-24 lg:py-32">
        <div
          className={cn(
            "max-w-[880px] rounded-xl border border-foreground/15 bg-background/80 p-6 shadow-sm backdrop-blur-md",
            "md:p-10 lg:p-14",
          )}
        >
          <h1 id="permit-hold-heading" style={heading} className={cn(FLUID_TYPE, "font-black tracking-[-0.045em] text-balance")}>
            {PERMIT_HOLD_COPY.heading}
          </h1>
          <p className="mt-6 max-w-[56ch] text-[20px] leading-[30px] font-medium md:mt-8">{PERMIT_HOLD_COPY.body}</p>
          <p className={cn("mt-4 max-w-[56ch] text-[18px] leading-[27px]", BODY_TEXT_COLOR)}>{PERMIT_HOLD_COPY.supporting}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
            <CtaLink href="/hills" variant="primary" className="h-14 px-7 text-[18px] leading-[27px] font-medium">
              Explore the hills
            </CtaLink>
            <CtaLink href={joinCta.href} variant="outline" className="h-14 px-7 text-[18px] leading-[27px] font-medium">
              {joinCta.label}
            </CtaLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
