import Image from "next/image";
import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { Tooltip } from "@/components/Tooltip";
import { JOIN_TOOLTIP } from "@/lib/navigation";
import { NextRunCard } from "@/components/home/NextRunCard";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { displayXL } from "@/lib/headings";
import type { RunOccurrence } from "@/lib/runs";
import { onDarkSurface } from "@/lib/surfaces";
import { HERO_TOP_PX } from "@/lib/hero-spacing";
import { cn } from "@/lib/utils";

/**
 * Hero "Make your own MTNS" — Figma 1:377 (desktop), 78:279 (tablet),
 * 78:397 (mobile). Measurements below are relative to the hero's visible area
 * (Figma's desktop hero starts under the 122px navigation).
 *
 *                 height  h1 top  h1 size   actions top  card
 *   mobile 393    614     52      48/52     230 (h48)    345 wide, top 326, inside
 *   tablet 768    670     66      98/102    304 (h56)    380 wide right, top 400, inside
 *   desktop 1400  846     115     209/204   677 (h56)    542 wide right, beside the
 *                                                        CTAs, overhangs ~74px
 * Values interpolate between frames (src/lib/fluid.ts).
 *
 * Deviations (logged in the Work Item):
 *   - Desktop CTAs and card are aligned to the container; Figma has them 19px
 *     and 27px inside it while tablet and mobile align (obvious inconsistency).
 *   - Photo (Round 2.1): the Owner's original photograph (1920×2560, cropped
 *     to its top 1900 rows and lightly graded; scripts/assets/build-hero.mjs),
 *     used at its real proportions. Figma's fill is the same photo with the hill
 *     stretched vertically (steeper) and extra sky; the code crops instead of
 *     stretching, and one image replaces Figma's two rasters.
 *   - "OWN MTNS" tracking is 0.048em (Figma: +10px at every size, which only
 *     matches line one's width on desktop).
 *
 * Mobile (PR #4 final refinements, Owner direction 2026-11-09), below 768:
 *   - the headline fills the content width: font size (100vw − 48px) / 6.24,
 *     each line being ≈ 6.1em wide (≈ 55px at 393, 44px at 320, 61px at 430);
 *     the 2% margin and no-wrap cover Linux's slightly wider rendering
 *   - the CTAs stack, full width: Find a Run, then Join the club
 *   - the next-run card sits at the bottom of the hero and hangs 96px below
 *     it, over the white page (the section's bottom margin holds that space)
 * Tablet and desktop are unchanged.
 *
 * ACCEPTED ACCESSIBILITY EXCEPTION (Owner decision, PR #3, 2026-11-08): the
 * headline is solid white (100%, like "JUST SHOW UP.") with no halo or shadow —
 * Figma's ghosted 60% and the soft halo were removed in the final refinement. Its
 * worst-region contrast over the pale sky is still below the 3:1 AA minimum for
 * large text (see the Work Item for the measurements). It is NOT WCAG AA
 * compliant and is not claimed to be. A tested alternative (75% over a headline
 * band) reached ≥ 3.19:1 and is recorded in .aiom/work/implement-cmr-homepage.md
 * should the decision be revisited.
 */
export function HomeHero({ next, now, held }: { next: RunOccurrence | null; now: Date; held?: boolean }) {
  const layout = fluidVars({
    "--hero-minh": [614, 670, 846],
    "--hero-pt": HERO_TOP_PX,
    // Reduced by the amount the shared hero top padding grew (+4 / +6) or raised (−19) the headline, so the buttons and card stay where Figma puts them.
    "--hero-actions-mt": [70, 28, 173],
    "--hero-card-mt": [48, 40, 40],
    "--hero-card-w": [345, 380, 542],
    "--hero-cta-h": [48, 56, 56],
  });
  const heading = displayXL();
  const cta = fluidType([15, 18, 18], [23, 27, 27]);

  return (
    <section
      aria-labelledby="hero-heading"
      style={layout}
      className={cn(
        "relative isolate z-10 bg-primary text-primary-foreground",
        "min-h-(--hero-minh-a) md:min-h-(--hero-minh-b)",
        // Mobile: a column, so the card can sit at the bottom; the margin is the white
        // space its overhang occupies.
        "max-md:mb-24 max-md:flex max-md:flex-col",
        onDarkSurface,
      )}
    >
      <PhotoBackdrop
        gradientOpacity="20"
        image={
          // One source, three crops (object-position), all at the photograph's real
          // proportions. The crest is ~74% down the file (row ~1410 of 1900) with the
          // runner centered. Tablet/mobile top-aligned (crest ~76–84% down the hero);
          // desktop 77% so the crest sits ~72% down, as in Figma, clear of the card.
          <Image
            src="/home/hero.jpg"
            alt=""
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover object-[50%_0%] lg:object-[50%_77%]"
          />
        }
      />

      <Container className="relative pt-(--hero-pt-a) max-md:flex max-md:flex-1 max-md:flex-col md:pt-(--hero-pt-b)">
        <h1
          id="hero-heading"
          style={heading}
          className={cn(
            FLUID_TYPE,
            "text-center font-black",
            // Mobile: fill the content width (each line is ≈ 6.1em wide), never wrapping a line.
            "max-md:text-[calc((100vw-48px)/6.24)] max-md:leading-[1.08] max-md:whitespace-nowrap",
          )}
        >
          {/* The space keeps the accessible name "MAKE YOUR OWN MTNS" (blocks don't add one). */}
          <span className="block">MAKE YOUR</span>{" "}
          <span className="block tracking-[0.048em]">OWN MTNS</span>
        </h1>

        <div className="relative mt-(--hero-actions-mt-a) max-md:flex max-md:flex-1 max-md:flex-col md:mt-(--hero-actions-mt-b)">
          <div
            style={cta}
            className={cn(
              FLUID_TYPE,
              // Mobile: stacked, full width (PR #4 final refinements). The auto margin takes
              // the hero's spare height, so the card lands at the bottom.
              "flex flex-col gap-3 max-md:mb-auto md:flex-row md:flex-nowrap",
              "*:h-(--hero-cta-h-a) md:*:h-(--hero-cta-h-b)",
            )}
          >
            <CtaLink href="/calendar" variant="primary" className="w-full px-5 md:w-auto md:px-7">
              Find a Run
            </CtaLink>
            <Tooltip text={JOIN_TOOLTIP} className="w-full md:w-auto">
              <CtaLink href="/join" variant="secondary" className="h-full w-full px-5 md:w-auto md:px-7">
                Join the club
              </CtaLink>
            </Tooltip>
          </div>

          <NextRunCard
            next={next}
            now={now}
            held={held}
            className={cn(
              "mt-(--hero-card-mt-a) w-full md:mt-(--hero-card-mt-b) md:ml-auto md:w-(--hero-card-w-b)",
              // Mobile: hang 96px below the hero, over the white page.
              "max-md:translate-y-24",
              "lg:absolute lg:top-0 lg:right-0 lg:mt-0",
            )}
          />
        </div>
      </Container>
    </section>
  );
}
