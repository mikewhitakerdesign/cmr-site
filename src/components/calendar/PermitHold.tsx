import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { FindHero } from "@/components/calendar/FindHero";
import { Tooltip } from "@/components/Tooltip";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { JOIN_TOOLTIP, joinCta } from "@/lib/navigation";
import { PERMIT_HOLD_COPY } from "@/lib/permit-hold";
import { cn } from "@/lib/utils";

/**
 * The permit-pending notice that replaces the Find a Run calendar while
 * official group runs are on hold (see src/lib/permit-hold.ts).
 *
 * Owner direction (2026-11-09, final refinements): the real Find a Run page is
 * the backdrop (its actual headline, set exactly as on the live page) and the
 * notice sits over it in a wide, centred glass panel: white at 70% with a soft
 * blur, so the headline behind stays perceptible and the notice reads at well
 * over 4.5:1 (black text on at least 70% white).
 *
 * The hold is a real restriction, so the backdrop is schedule-free and dead: only
 * the headline (no intro copy, no weather panel and so no weather request, no
 * dates, runs or actions), and it is `inert` and `aria-hidden`, so it takes no
 * focus, no clicks and is not read out. There is no dismiss control.
 *
 * A static message, not an alert: nothing here changes while the visitor is on
 * the page, so no live region and no `role="alert"`. No agency name, logo or
 * application status is shown or implied.
 */
export function PermitHold() {
  const heading = fluidType([36, 56, 80], [36, 54, 76]);
  return (
    <section aria-labelledby="permit-hold-heading" data-slot="permit-hold" className="relative isolate grid overflow-hidden">
      <div aria-hidden inert data-slot="permit-hold-backdrop" className="pointer-events-none col-start-1 row-start-1 select-none">
        <FindHero held />
      </div>
      <Container className="col-start-1 row-start-1 flex items-center justify-center py-10 md:py-16 lg:py-20">
        <div
          data-slot="permit-hold-panel"
          className={cn(
            "w-full max-w-[1040px] rounded-xl border border-foreground/10 bg-background/70 p-7 text-foreground shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-[6px]",
            "md:p-12 lg:p-16",
          )}
        >
          <h1 id="permit-hold-heading" style={heading} className={cn(FLUID_TYPE, "font-black tracking-[-0.045em] text-balance")}>
            {PERMIT_HOLD_COPY.heading}
          </h1>
          <p className="mt-6 max-w-[56ch] text-[20px] leading-[30px] font-normal md:mt-8">{PERMIT_HOLD_COPY.body}</p>
          <p className="mt-4 max-w-[56ch] text-[18px] leading-[27px] text-foreground/80">{PERMIT_HOLD_COPY.supporting}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
            <CtaLink href="/hills" variant="primary" className="h-14 px-7 text-[18px] leading-[27px] font-medium">
              Explore the hills
            </CtaLink>
            <Tooltip text={JOIN_TOOLTIP} className="max-sm:w-full">
              <CtaLink href={joinCta.href} variant="outline" className="h-14 px-7 text-[18px] leading-[27px] font-medium max-sm:w-full">
                {joinCta.label}
              </CtaLink>
            </Tooltip>
          </div>
        </div>
      </Container>
    </section>
  );
}
