import Image from "next/image";
import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
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
 * Legibility adjustment (not in Figma): a 30% black shade over the photo and copy
 * at 90% white instead of 75%. The heading clears 3:1 in its worst region.
 *
 * ACCEPTED ACCESSIBILITY EXCEPTION (Owner decision, PR #3, 2026-11-08): the body
 * copy measures about 3.6–4.0:1 in its worst region where lines cross bright
 * foliage, below the 4.5:1 AA minimum. It is NOT WCAG AA compliant and is not
 * claimed to be. A tested alternative (42% shade, full-white copy) reached
 * ≥ 4.5:1 and is recorded in .aiom/work/implement-cmr-homepage.md.
 *
 * Tracking is −0.045em at every size (Figma: −6.48px everywhere, which is
 * −0.045em at 144px but makes letters collide at 56px — "JUSTSHOW" in the
 * mobile frame). Owner decision D4: correct colliding type.
 */
export function JustShowUp() {
  const layout = fluidVars({
    "--jsu-minh": [460, 430, 626.6],
    "--jsu-pt": [64, 64, 144],
    "--jsu-copy-mt": [24, 24, 32],
    "--jsu-cta-mt": [28, 28, 40],
    "--jsu-cta-h": [52, 52, 56],
  });
  const heading = fluidType([56, 80, 144], [56, 80, 129.6]);
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
        {/* Legibility shade (not in Figma). Keeps the heading ≥ 3:1; the copy remains an
            accepted exception below 4.5:1 (see the component comment). */}
        <div data-slot="legibility-shade" className="absolute inset-0 bg-primary/30" />
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
            "mt-(--jsu-copy-mt-a) font-medium text-primary-foreground/90 md:mt-(--jsu-copy-mt-b) md:max-w-[540px] lg:max-w-[630px]",
          )}
        >
          No membership fee. No pace requirement. No complicated initiation ritual. Find a run, show up and climb the
          same hill until it means something.
        </p>
        <div className="mt-(--jsu-cta-mt-a) flex flex-wrap gap-3 text-[18px] leading-[27px] md:mt-(--jsu-cta-mt-b) *:h-(--jsu-cta-h-a) md:*:h-(--jsu-cta-h-b)">
          <CtaLink href="/calendar" variant="primary" className="px-7">
            Find a Run
          </CtaLink>
          <CtaLink href="/join" variant="secondary" className="px-7">
            Join the club
          </CtaLink>
        </div>
      </Container>
    </section>
  );
}
