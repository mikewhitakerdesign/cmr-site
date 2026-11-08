import { getImageProps } from "next/image";
import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { NextRunCard } from "@/components/home/NextRunCard";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import type { RunOccurrence } from "@/lib/runs";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * Headline legibility shade (accessibility deviation, Owner/GPT review of PR #3).
 * A horizontal band of the foreground token behind the headline only: full
 * strength across the headline's two line boxes, feathering out above and below
 * with eased stops so it reads as deeper sky rather than a stripe. The sky above
 * and the hill below keep their original brightness.
 */
const SHADE_ALPHA = 45; // % of --foreground at full strength
const shadeAt = (k: number) => `color-mix(in srgb, var(--foreground) ${SHADE_ALPHA * k}%, transparent)`;
const HEADLINE_SHADE = `linear-gradient(to bottom, ${[
  `${shadeAt(0)} 0`,
  `${shadeAt(0.1)} calc(var(--f) * 0.25)`,
  `${shadeAt(0.5)} calc(var(--f) * 0.5)`,
  `${shadeAt(0.9)} calc(var(--f) * 0.75)`,
  `${shadeAt(1)} var(--f)`,
  `${shadeAt(1)} calc(100% - var(--f))`,
  `${shadeAt(0.9)} calc(100% - var(--f) * 0.75)`,
  `${shadeAt(0.5)} calc(100% - var(--f) * 0.5)`,
  `${shadeAt(0.1)} calc(100% - var(--f) * 0.25)`,
  `${shadeAt(0)} 100%`,
].join(", ")})`;

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
 *   - Figma's desktop fill is a 768×1024 portrait photo stretched non-uniformly
 *     (≈2.26× across, 0.95× down). The code crops the same photo uniformly and
 *     places the crest where Figma has it (≈72% down) instead of distorting it.
 *     Both are soft at desktop size until the original photo is supplied (D3).
 *   - "OWN MTNS" tracking is 0.048em (Figma: +10px at every size, which only
 *     matches line one's width on desktop).
 *   - Accessibility: headline at 75% white (Figma 60%) over a 45% shade confined
 *     to the headline band. Figma's 60% over pale sky measured 1.23–1.32:1; this
 *     measures ≥ 3.2:1 worst-case at every tested width (tests/e2e/contrast.mjs).
 */
export function HomeHero({ next, now }: { next: RunOccurrence | null; now: Date }) {
  // Headline shade geometry, derived from the headline's own values so it tracks
  // it at every width: top = h1 top − feather; height = 2 lines + 2 feathers.
  const pt = [52, 66, 115] as const;
  const lineHeight = [52, 102, 204] as const;
  const feather = [80, 96, 160] as const;
  const layout = fluidVars({
    "--hero-minh": [614, 670, 846],
    "--hero-pt": pt,
    "--hero-shade-top": [pt[0] - feather[0], pt[1] - feather[1], pt[2] - feather[2]],
    "--hero-shade-h": [2 * lineHeight[0] + 2 * feather[0], 2 * lineHeight[1] + 2 * feather[1], 2 * lineHeight[2] + 2 * feather[2]],
    "--hero-shade-f": feather,
    "--hero-actions-mt": [74, 34, 154],
    "--hero-card-mt": [48, 40, 40],
    "--hero-card-w": [345, 380, 542],
    "--hero-cta-h": [48, 56, 56],
  });
  const heading = fluidType([48, 98, 209], lineHeight);
  const cta = fluidType([15, 18, 18], [23, 27, 27]);

  // Two Figma rasters: desktop (1:377) and tablet/mobile (78:279, 78:397) use
  // different frames of the same scene. Art-directed with <picture>.
  const common = { alt: "", sizes: "100vw", fetchPriority: "high" as const, width: 768, height: 1024 };
  const { props: desktopProps } = getImageProps({ ...common, src: "/home/hero-desktop.jpg" });
  const { props: imgProps } = getImageProps({ ...common, src: "/home/hero.jpg", loading: "eager" });

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
          <picture>
            <source media="(min-width: 1024px)" srcSet={desktopProps.srcSet} sizes={desktopProps.sizes} />
            {/* Art direction via getImageProps (optimized srcset, plain <img>). */}
            <img
              {...imgProps}
              alt=""
              className="absolute inset-0 size-full object-cover object-center lg:object-[50%_72%]"
            />
          </picture>
        }
      >
        <div
          data-slot="headline-shade"
          style={{ backgroundImage: HEADLINE_SHADE }}
          className={cn(
            "absolute inset-x-0",
            "top-(--hero-shade-top-a) h-(--hero-shade-h-a) [--f:var(--hero-shade-f-a)]",
            "md:top-(--hero-shade-top-b) md:h-(--hero-shade-h-b) md:[--f:var(--hero-shade-f-b)]",
          )}
        />
      </PhotoBackdrop>

      <Container className="relative pt-(--hero-pt-a) md:pt-(--hero-pt-b)">
        <h1
          id="hero-heading"
          style={heading}
          className={cn(
            FLUID_TYPE,
            // 75% (Figma 60%): still ghosted, with the headline shade ≥ 3:1 (see above).
            "text-center font-black opacity-75",
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
            <CtaLink href="/calendar" variant="solid" className="px-5 md:px-7">
              Find a Run
            </CtaLink>
            <CtaLink href="/join" variant="outline" className="grow px-5 md:grow-0 md:px-7">
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
