import { Container } from "@/components/Container";
import { ContourField } from "@/components/ContourField";
import { CtaLink } from "@/components/CtaLink";
import { TopoPattern } from "@/components/home/TopoPattern";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { joinCta } from "@/lib/navigation";
import { PERMIT_HOLD_COPY } from "@/lib/permit-hold";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * The permit-pending notice that replaces the Find a Run calendar while
 * official group runs are on hold (see src/lib/permit-hold.ts).
 *
 * Owner direction (2026-11-09): the hill-page visual language. A black hero with
 * the slow white contour field behind (ContourField; one still frame under
 * reduced motion or software WebGL; the static pattern without WebGL2), and the
 * notice on top in a slightly translucent glass panel (white at 10% with a light
 * blur and a hairline border). The panel sits over a near-black ground, so white
 * text stays at or above 15:1 however the lines drift behind it.
 *
 * A static message, not an alert: nothing here changes while the visitor is on
 * the page, so no live region and no `role="alert"`.
 *
 * No agency name, logo or application status is shown or implied.
 */
export function PermitHold() {
  const heading = fluidType([40, 64, 96], [40, 62, 90]);
  return (
    <section
      aria-labelledby="permit-hold-heading"
      data-slot="permit-hold"
      className={cn("relative isolate overflow-hidden bg-primary text-primary-foreground", onDarkSurface)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <ContourField
          className="bg-primary text-primary-foreground"
          scale={940}
          levels={4.5}
          seed={11}
          fallback={<TopoPattern className="text-(--cmr-contour-on-dark)" />}
        />
      </div>
      <Container className="py-14 md:py-24 lg:py-32">
        <div
          data-slot="permit-hold-panel"
          className={cn(
            "max-w-[880px] rounded-xl border border-primary-foreground/25 bg-primary-foreground/10 p-6 shadow-lg backdrop-blur-md",
            "md:p-10 lg:p-14",
          )}
        >
          <h1 id="permit-hold-heading" style={heading} className={cn(FLUID_TYPE, "font-black tracking-[-0.045em] text-balance")}>
            {PERMIT_HOLD_COPY.heading}
          </h1>
          <p className="mt-6 max-w-[56ch] text-[20px] leading-[30px] font-medium md:mt-8">{PERMIT_HOLD_COPY.body}</p>
          <p className="mt-4 max-w-[56ch] text-[18px] leading-[27px] text-primary-foreground/85">{PERMIT_HOLD_COPY.supporting}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
            <CtaLink href="/hills" variant="secondary" className="h-14 px-7 text-[18px] leading-[27px] font-medium">
              Explore the hills
            </CtaLink>
            <CtaLink href={joinCta.href} variant="outlineOnDark" className="h-14 px-7 text-[18px] leading-[27px] font-medium">
              {joinCta.label}
            </CtaLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
