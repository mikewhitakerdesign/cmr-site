import { ArrowLink } from "@/components/ArrowLink";
import { Container } from "@/components/Container";
import { HillsExplorer } from "@/components/home/HillsExplorer";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { BODY_TEXT_COLOR, DISPLAY_HEADING, impactH2 } from "@/lib/headings";
import { DEFAULT_PROFILE_SLUG, type Hill } from "@/lib/hills";
import { cn } from "@/lib/utils";

/**
 * Chicago hills, "Get high in the city." — Figma 1:118 (desktop), 78:323
 * (tablet), 78:441 (mobile).
 *
 *            section  intro                         illustration          rows
 *   mobile   py56     one column, h2 48/48          345 wide, below copy  100 tall, name 28/36, place below
 *   tablet   py56     310 column, h2 54/54          314 wide, right       96 tall, name 32/36, place below
 *   desktop  py128    502 column, h2 96/88 (pt16)   620 wide, right       110 tall, name 64/60.8, place right, ↗
 *
 * Responsive classification (Owner decision D4):
 *   - "Explore all hills" appears only in the desktop frame. It is the
 *     section's only path to /hills, so it is treated as incomplete design and
 *     kept at every size (without the arrow below desktop, matching how those
 *     frames treat "See the full schedule"). Its place below the copy uses the
 *     space Figma leaves before the illustration and list.
 *   - Row ↗ arrows: desktop only (intentional adaptation, as drawn).
 *   - The grey row (#ececec = `border` token; Mt. Trashmore in Figma) marks
 *     the hill whose profile is shown.
 *
 * Round 2 (Owner direction, 2026-11-08): the single Figma raster became an
 * interactive family of five vector terrain profiles with pastel annotations
 * (HillsExplorer, HillProfile). Mt. Trashmore shows by default; hovering or
 * focusing a row previews that hill; rows navigate to the hill's page.
 */
export function ChicagoHills({ hills }: { hills: Hill[] }) {
  const layout = fluidVars({
    "--hills-py": [56, 56, 128],
    "--hills-gap-x": [0, 48, 64],
    "--hills-h2-mt": [0, 0, 16],
    "--hills-link-mt": [32, 32, 33],
    "--hills-fig-mt": [28, 14, 0],
    "--hills-list-mt": [34, 34, 48],
  });
  const heading = impactH2();
  const copy = fluidType([16, 16, 18], [24, 24, 27]);

  const intro = (
    <div className="lg:max-w-[502px]">
      <h2
        id="hills-heading"
        style={heading}
        className={cn(FLUID_TYPE, DISPLAY_HEADING, "mt-(--hills-h2-mt-a) ss08 md:mt-(--hills-h2-mt-b)")}
      >
        Get high in the city.
      </h2>
      <p style={copy} className={cn(FLUID_TYPE, BODY_TEXT_COLOR, "mt-6 font-normal ss08 lg:max-w-[474px]")}>
        You don&apos;t need mountains to train for mountains. These are the hills, sledding slopes and
        questionable pieces of landfill elevation we run repeatedly around Chicago.
      </p>
      <ArrowLink
        href="/hills"
        className="mt-(--hills-link-mt-a) text-p md:mt-(--hills-link-mt-b)"
        arrowClassName="hidden lg:block"
      >
        Explore all hills
      </ArrowLink>
    </div>
  );

  return (
    <section
      aria-labelledby="hills-heading"
      className="bg-background text-foreground py-(--hills-py-a) md:py-(--hills-py-b)"
      style={layout}
    >
      <Container>
        <HillsExplorer hills={hills} defaultSlug={DEFAULT_PROFILE_SLUG} intro={intro} />
      </Container>
    </section>
  );
}
