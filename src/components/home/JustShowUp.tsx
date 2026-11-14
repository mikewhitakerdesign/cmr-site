import Image from "next/image";
import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { Tooltip } from "@/components/Tooltip";
import { JOIN_TOOLTIP } from "@/lib/navigation";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { impactH2 } from "@/lib/headings";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * "JUST SHOW UP." — Figma 1:296 (desktop), 78:348 (tablet), 78:466 (mobile).
 *
 *            height  pt   h2           copy (75% white)       CTAs
 *   mobile   460     64   56/56 (2 ln) +24, 16/24, full       +28, h52
 *   tablet   430     64   80/80        +24, 16/24, 550 wide   +28, h52
 *   desktop  627     144  144/129.6    +32, 18/27, 630 wide   +40, h56
 *
 * Photo: the Figma fill (4096×3076, served as a 2880px JPEG master), cropped as
 * Figma does — anchored ~6% from the top on desktop, centered elsewhere —
 * under the same baked mesh gradient as the hero at 50%.
 *
 * Legibility adjustment (not in Figma): a 38% black shade over the photo, and the
 * copy in full white (Brand Standards Review 01, 2026-11-14; was 30% and 90%
 * white, an Owner-accepted exception at 3.5–4.2:1). Measured worst-region
 * contrast (tests/e2e/contrast.mjs, macOS Chromium, 12 widths 320–1920): copy
 * 4.82–5.71:1 against the 4.5:1 AA minimum, heading 4.46–5.11:1 against 3:1.
 * The smallest change that passes at every width: full-white copy alone reached
 * 3.96–4.35:1, and a 35% shade 4.47:1 at 1920.
 *
 * Tracking is −0.045em at every size (Figma: −6.48px everywhere, which is
 * −0.045em at 144px but makes letters collide at 56px — "JUSTSHOW" in the
 * mobile frame). Owner decision D4: correct colliding type.
 */
/** The one body copy for every "Just show up." section (home, Hills on hills, About); v1.1 replaced the held/unheld pair. */
export const JUST_SHOW_UP_COPY =
  "No membership fee. No pace requirement. No complicated initiation ritual. Find a hill, show up and climb it until it means something. Join the club to join the weekly group runs.";

export function JustShowUp() {
  const layout = fluidVars({
    "--jsu-minh": [460, 430, 626.6],
    "--jsu-pt": [64, 64, 144],
    "--jsu-copy-mt": [24, 24, 32],
    "--jsu-cta-mt": [28, 28, 40],
    "--jsu-cta-h": [52, 52, 56],
  });
  const heading = impactH2();
  const copy = fluidType([16, 16, 18], [24, 24, 27]);

  return (
    <section
      aria-labelledby="just-show-up-heading"
      style={layout}
      className={cn(
        "relative isolate bg-primary text-primary-foreground",
        "min-h-(--jsu-minh-a) pt-(--jsu-pt-a) pb-16 md:min-h-(--jsu-minh-b) md:pt-(--jsu-pt-b)",
        onDarkSurface,
      )}
    >
      <PhotoBackdrop
        gradientOpacity="50"
        image={
          <Image
            src="/home/just-show-up.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center lg:object-[50%_6%]"
          />
        }
      >
        {/* Legibility shade (not in Figma): the heading ≥ 3:1 and the copy ≥ 4.5:1 (see the component comment). */}
        <div data-slot="legibility-shade" className="absolute inset-0 bg-primary/38" />
      </PhotoBackdrop>
      <Container>
        <h2
          id="just-show-up-heading"
          style={heading}
          className={cn(FLUID_TYPE, "font-black tracking-[-0.045em] ss08")}
        >
          JUST SHOW UP.
        </h2>
        <p
          style={copy}
          className={cn(
            FLUID_TYPE,
            // Tablet measure 540, not Figma's 550: Figma's text renders ~1% wider and breaks
            // before "ritual."; at 550 the browser fits it, which moves the CTAs up a line.
            "mt-(--jsu-copy-mt-a) font-normal text-primary-foreground md:mt-(--jsu-copy-mt-b) md:max-w-[540px] lg:max-w-[630px]",
          )}
        >
          {JUST_SHOW_UP_COPY}
        </p>
        <div className="mt-(--jsu-cta-mt-a) flex flex-wrap gap-3 text-[18px] leading-[27px] md:mt-(--jsu-cta-mt-b) *:h-(--jsu-cta-h-a) md:*:h-(--jsu-cta-h-b)">
          <CtaLink href="/calendar" variant="primary" className="px-7">
            Find a Run
          </CtaLink>
          <Tooltip text={JOIN_TOOLTIP}>
            <CtaLink href="/join" variant="secondary" className="h-full px-7">
              Join the club
            </CtaLink>
          </Tooltip>
        </div>
      </Container>
    </section>
  );
}
