import Image from "next/image";
import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { cn } from "@/lib/utils";

/**
 * Community introduction — Figma 1:16 (desktop), 78:291 (tablet), 78:409 (mobile).
 *
 *                 height  block top  mark (w×h)     gap   statement
 *   mobile 393    390     64         30.7 × 127     17.3  27/29, 297 wide
 *   tablet 768    442     70         60.5 × 250     27.5  42/44, 584 wide
 *   desktop 1400  589     177        93 × 385       36    64/68, max 1053
 *
 * Geist Black with stylistic set 08; "sanity" struck through and kept in the
 * accessible text (foundation precedent for struck-through jokes).
 *
 * Round 2 (Owner direction, 2026-11-08): the name stays black; the description
 * from "is a running community…" is `muted-foreground` (#737373, 4.7:1 on
 * white — AA even at body size); the TM drops from 0.645em to 0.3em and sits as
 * a superscript on the cap line.
 *
 * Deviations: the block is aligned to the container (Figma's desktop block
 * starts 9px left of it and its 1053px text overflows a 1024px parent), and the
 * mark is vertically centered on the statement at every size (tablet's mark
 * sits 39px high in Figma; desktop and mobile center it).
 *
 * The mark (a vertical hill silhouette) is the Figma image fill, cropped and
 * rotated exactly as the frame shows it (public/home/README.md). Decorative.
 */
export function CommunityIntro() {
  const layout = fluidVars({
    "--intro-minh": [390, 442, 589],
    "--intro-pt": [64, 70, 177],
    "--intro-gap": [17.26, 27.45, 36],
    "--intro-mark-w": [30.74, 60.55, 93],
    "--intro-mark-h": [127.05, 250.25, 385],
  });
  const statement = fluidType([27, 42, 64], [29, 44, 68]);

  return (
    <section
      style={layout}
      className="bg-background text-foreground min-h-(--intro-minh-a) md:min-h-(--intro-minh-b)"
    >
      <Container className="pt-(--intro-pt-a) md:pt-(--intro-pt-b)">
        <div className="flex items-center gap-(--intro-gap-a) md:gap-(--intro-gap-b)">
          <div
            aria-hidden
            className="relative shrink-0 w-(--intro-mark-w-a) h-(--intro-mark-h-a) md:w-(--intro-mark-w-b) md:h-(--intro-mark-h-b)"
          >
            <Image src="/home/community-mark.png" alt="" fill sizes="93px" className="object-fill" />
          </div>
          <p style={statement} className={cn(FLUID_TYPE, "max-w-[1053px] font-black ss08")}>
            Chicago Mountain Runners
            {/* A true superscript: ~30% of the type size, its top on the cap line, set
                with `relative` so it never stretches the line box. */}
            <sup className="relative -top-[1.6em] ml-[0.06em] align-baseline text-[0.3em] leading-none tracking-normal">
              TM
            </sup>{" "}
            <span className="text-muted-foreground">
              is a running community for finding elevation, running it repeatedly and occasionally questioning our{" "}
              <s>sanity</s> decisions.
            </span>
          </p>
        </div>
      </Container>
    </section>
  );
}
