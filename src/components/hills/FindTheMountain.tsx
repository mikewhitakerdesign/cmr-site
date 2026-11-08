import { Container } from "@/components/Container";
import { ctaLinkVariants } from "@/components/CtaLink";
import { MapPinIcon, NavigationIcon } from "@/components/icons";
import { BODY, EYEBROW, SECTION_HEADING, sectionHeading } from "@/components/hills/styles";
import { FLUID_TYPE } from "@/lib/fluid";
import type { HillWithPage } from "@/lib/hills";
import { directionsUrl, mapUrl } from "@/lib/maps";
import { cn } from "@/lib/utils";

const ACTION = "h-11 gap-2 px-5 text-[16px] leading-6 font-medium";

/**
 * "Find the mountain." — Figma 1:6702: heading, address lines (18/27 at 70%),
 * "Get directions" (black, navigation icon) and "View map" (1px outline), and
 * the map placeholder. Desktop 628 | 628 (gap 48), tablet 312 | 312, mobile
 * stacked with the placeholder last. Padding 96.
 *
 * The two actions are plain outbound links to a map service (src/lib/maps.ts),
 * opened in a new tab; nothing is embedded or loaded. They target the park or
 * landmark — a note under them says so, because CMR meeting points live on
 * each run, not here.
 *
 * The placeholder is Figma's "MapPlaceholder", kept as drawn: a schematic
 * (one road curve, one straight line, a pin chip), not a map. Desktop draws it
 * light grey on muted grey; tablet and mobile draw it in black on white with a
 * black outline (each frame as drawn). It carries a "Not a map" label so no
 * one navigates by it. Decorative for assistive tech: the address is text.
 */
export function FindTheMountain({ hill }: { hill: HillWithPage }) {
  const { page } = hill;

  return (
    <section aria-labelledby="find-heading" className="py-24">
      <Container className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <h2 id="find-heading" style={sectionHeading()} className={cn(FLUID_TYPE, SECTION_HEADING)}>
            Find the mountain.
          </h2>
          <address className={cn(BODY, "pt-6 not-italic text-foreground/70")}>
            {page.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <div className="flex flex-wrap gap-3 pt-8">
            <a href={directionsUrl(page.mapQuery)} target="_blank" rel="noopener noreferrer" className={cn(ctaLinkVariants({ variant: "primary" }), ACTION)}>
              <span>
                {/* The space sits outside the hidden span: name computation trims a child's leading space. */}
                Get directions <span className="sr-only">to {page.address[0]} (opens in a new tab)</span>
              </span>
              <NavigationIcon className="size-4" />
            </a>
            <a href={mapUrl(page.mapQuery)} target="_blank" rel="noopener noreferrer" className={cn(ctaLinkVariants({ variant: "outline" }), ACTION)}>
              View map <span className="sr-only">of {page.address[0]} (opens in a new tab)</span>
            </a>
          </div>
          <p className="max-w-[448px] pt-4 text-p-mini text-muted-foreground">
            Directions go to the park, not a meeting point. Each run lists where to meet.
          </p>
        </div>

        <div
          aria-hidden
          data-slot="map-placeholder"
          className={cn(
            "relative h-48 overflow-hidden rounded-xl border border-foreground bg-background text-foreground md:h-44 lg:h-[353px]",
            "lg:border-border lg:bg-muted lg:text-border",
          )}
        >
          {/* Figma's two schematic lines (1:6601, 1:6602), redrawn in currentColor so each frame's color applies. */}
          <svg viewBox="0 0 626 351" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <path
              d="M-16 231C93.8 216.4 210.9 220 335.3 242C459.7 264 562.2 260.3 642.6 231"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              vectorEffect="non-scaling-stroke"
            />
            <path d="M115.4 0L181.3 351" fill="none" stroke="currentColor" strokeOpacity={0.6} strokeWidth={0.9} vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <p className="flex items-center gap-2 rounded-full border border-foreground bg-background px-3 py-1.5 text-[14px] leading-5 font-medium text-foreground lg:border-border">
              <MapPinIcon className="size-4 shrink-0" />
              {page.mapLabel}
            </p>
          </div>
          <p className={cn(EYEBROW, "absolute bottom-3 left-4 text-[11px] leading-4 text-muted-foreground")}>Not a map</p>
        </div>
      </Container>
    </section>
  );
}
