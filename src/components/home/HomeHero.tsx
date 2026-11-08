import Image from "next/image";
import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { NextRunCard } from "@/components/home/NextRunCard";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import type { RunOccurrence } from "@/lib/runs";
import { onDarkSurface } from "@/lib/surfaces";
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
 * ACCEPTED ACCESSIBILITY EXCEPTION (Owner decision, PR #3, 2026-11-08): the
 * headline keeps Figma's ghosted 60% white, plus a soft halo. Its worst-region
 * contrast over the sky is about 1.2–1.3:1, below the 3:1 AA minimum for large
 * text. It is NOT WCAG AA compliant and is not claimed to be. A tested
 * alternative (75% over a headline band) reached ≥ 3.19:1 and is recorded in
 * .aiom/work/implement-cmr-homepage.md should the decision be revisited.
 */
export function HomeHero({ next, now }: { next: RunOccurrence | null; now: Date }) {
  const layout = fluidVars({
    "--hero-minh": [614, 670, 846],
    "--hero-pt": [52, 66, 115],
    "--hero-actions-mt": [74, 34, 154],
    "--hero-card-mt": [48, 40, 40],
    "--hero-card-w": [345, 380, 542],
    "--hero-cta-h": [48, 56, 56],
  });
  const heading = fluidType([48, 98, 209], [52, 102, 204]);
  const cta = fluidType([15, 18, 18], [23, 27, 27]);

  return (
    <section
      aria-labelledby="hero-heading"
      style={layout}
      className={cn(
        "relative isolate z-10 bg-primary text-primary-foreground",
        "min-h-(--hero-minh-a) md:min-h-(--hero-minh-b)",
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

      <Container className="relative pt-(--hero-pt-a) md:pt-(--hero-pt-b)">
        <h1
          id="hero-heading"
          style={heading}
          className={cn(
            FLUID_TYPE,
            "text-center font-black opacity-60",
            // Legibility halo (not in Figma): a soft shadow in the foreground token
            // separates the ghosted 60% letters from pale sky. See Owner decision D6.
            "[text-shadow:0_0_0.12em_color-mix(in_srgb,var(--foreground)_30%,transparent)]",
          )}
        >
          {/* The space keeps the accessible name "MAKE YOUR OWN MTNS" (blocks don't add one). */}
          <span className="block">MAKE YOUR</span>{" "}
          <span className="block tracking-[0.048em]">OWN MTNS</span>
        </h1>

        <div className="relative mt-(--hero-actions-mt-a) md:mt-(--hero-actions-mt-b)">
          <div
            style={cta}
            className={cn(
              FLUID_TYPE,
              // Mobile: the pair fills the row (Figma 116 + 217 = 345); below ~360px the
              // second CTA drops to its own full-width row instead of overflowing.
              "flex flex-wrap gap-3 md:flex-nowrap",
              "*:h-(--hero-cta-h-a) md:*:h-(--hero-cta-h-b)",
            )}
          >
            <CtaLink href="/calendar" variant="primary" className="px-[19px] md:px-[27px]">
              Find a Run
            </CtaLink>
            <CtaLink href="/join" variant="secondary" className="grow px-[19px] md:grow-0 md:px-[27px]">
              Become a Mtn Runner
            </CtaLink>
          </div>

          <NextRunCard
            next={next}
            now={now}
            className={cn(
              "mt-(--hero-card-mt-a) w-full md:mt-(--hero-card-mt-b) md:ml-auto md:w-(--hero-card-w-b)",
              "lg:absolute lg:top-0 lg:right-0 lg:mt-0",
            )}
          />
        </div>
      </Container>
    </section>
  );
}
