import Image from "next/image";
import { Container } from "@/components/Container";
import { ctaLinkVariants } from "@/components/CtaLink";
import { MapPinIcon, NavigationIcon } from "@/components/icons";
import { BODY, SECTION_HEADING, sectionHeading } from "@/components/hills/styles";
import { FLUID_TYPE } from "@/lib/fluid";
import type { HillWithPage } from "@/lib/hills";
import { directionsUrl, mapUrl } from "@/lib/maps";
import { cn } from "@/lib/utils";

const ACTION = "h-11 gap-2 px-5 text-[16px] leading-6 font-medium";

/**
 * "Find what you've been looking for." — Figma "Find the mountain." 1:6702
 * (address lines 18/27 at 70%, "Get directions" black with the navigation
 * icon, "View map" outlined, the map beside them). Padding 96.
 *
 * Refinement pass (Owner direction, 2026-11-08):
 *   - the heading is the new line, "Find what you've been looking for."
 *     (PR #4 final refinements, 2026-11-09: it sits in the left column with
 *     the address, actions and note, opposite the map, which is centred
 *     vertically against them; three lines on desktop, "Find what / you've
 *     been / looking for."; natural wrapping on tablet and phones, stacked
 *     above the map on phones)
 *   - the placeholder is now a real map: a static, greyscale OpenStreetMap
 *     image centred on the place (scripts/assets/build-hill-maps.mjs), with a
 *     pin at the centre and the required attribution. No embed and no map
 *     service called at runtime.
 *   - address, actions and note unchanged
 *   - final pass (2026-11-09): the map eases in 6% on hover (1 s, about the
 *     centre, so the pin stays put); none under reduced motion
 *
 * The two actions are plain outbound links to a map service (src/lib/maps.ts),
 * opened in a new tab. They and the pin target the park or landmark; the note
 * says so, because CMR meeting points live on each run, not here.
 */
export function FindTheMountain({ hill }: { hill: HillWithPage }) {
  const { page } = hill;

  return (
    <section aria-labelledby="find-heading" className="py-24">
      <Container className="grid gap-x-12 gap-y-10 md:grid-cols-2 md:items-center">
        <div>
          {/* Three lines on desktop; natural wrapping below (spaces kept for the accessible name). */}
          <h2 id="find-heading" style={sectionHeading()} className={cn(FLUID_TYPE, SECTION_HEADING)}>
            <span className="lg:block">Find what</span> <span className="lg:block">you&apos;ve been</span>{" "}
            <span className="lg:block">looking for.</span>
          </h2>
          <address className={cn(BODY, "pt-6 not-italic text-foreground/70 md:pt-8")}>
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

        <figure data-slot="hill-map" className="group/map relative aspect-[16/9] overflow-hidden rounded-xl border border-foreground bg-muted">
          <Image
            src={page.mapImage}
            alt={`Street map around ${page.address[0]}. The pin marks the park, not a meeting point.`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            // A slow, slight zoom on hover, about the centre so the pin stays on the place.
            className="object-cover motion-safe:transition-transform motion-safe:duration-1000 motion-safe:ease-out motion-safe:group-hover/map:scale-[1.06]"
          />
          {/* The image is centred on the place, so the pin sits at the centre. */}
          <div aria-hidden className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
            <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] leading-4 font-medium whitespace-nowrap text-primary-foreground md:text-[14px] md:leading-5">
              <MapPinIcon className="size-4 shrink-0" />
              {page.mapLabel}
            </span>
            <span className="h-2.5 w-px bg-primary" />
            <span className="-mb-1 size-2 rounded-full border-2 border-background bg-primary box-content" />
          </div>
          <figcaption className="absolute right-0 bottom-0 rounded-tl-md bg-background/90 px-2 py-0.5 text-[11px] leading-4 text-foreground">
            ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              rel="noopener noreferrer"
              className="rounded-xs underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring"
            >
              OpenStreetMap
            </a>{" "}
            contributors
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
