import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { DISPLAY_HEADING } from "@/lib/headings";
import { joinCta } from "@/lib/navigation";
import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

/**
 * "Come for the hills. Stay for the people." on the pale tie-dye fill (the
 * homepage circles' fill, replacing the old flat mint sections). The button is
 * the shared Join CTA ("Join the club", /join); the Join page itself is not
 * touched by this milestone.
 */
export function CommunityCta() {
  return (
    <section
      aria-labelledby="community-heading"
      style={tintVars(0)}
      className="relative isolate overflow-hidden bg-(--tie-wash) py-20 text-foreground md:py-28"
    >
      <div aria-hidden className="cmr-tie-dye absolute -z-10" />
      <Container className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
        <h2 id="community-heading" style={fluidType([44, 56, 72], [44, 56, 68])} className={cn(FLUID_TYPE, DISPLAY_HEADING, "max-w-[18ch] text-balance")}>
          Come for the hills. Stay for the people<span className="ss08">.</span>
        </h2>
        <CtaLink href={joinCta.href} className="h-14 px-7 text-[18px] leading-[27px] font-medium">
          {joinCta.label}
        </CtaLink>
      </Container>
    </section>
  );
}
