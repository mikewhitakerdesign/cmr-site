import { Container } from "@/components/Container";
import { ProvisionalBadge } from "@/components/ProvisionalBadge";
import type { ClubTotals as ClubTotalsData } from "@/lib/club-totals";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { cn } from "@/lib/utils";

/**
 * "2026 club totals." — Figma 1:243 (desktop), 78:294 (tablet), 78:412 (mobile).
 *
 *                 height  heading       values         labels   columns
 *   mobile 393    358     32/34 at 32   48/54, +38     13/18 +6 2 × 162.5, gap 20, rows +34
 *   tablet 768    272     44/46 at 32   48/54, +30     13/18 +6 4 × 150, gap 24
 *   desktop 1400  492     64/60.8 @137  96/60.8, +76   16/24 +12 4 × 302, gap 32
 *
 * Rendered white with no column rules, as approved: Figma's cream fill
 * (#f4f1e8) is fully covered by a white child and its white top rules are
 * invisible on white (logged for design cleanup). The empty 144×24 frame right
 * of the heading (1:254) holds the provisional marker while the figures are
 * unverified.
 *
 * Semantics: a description list; each value (<dd>) is shown above its label
 * (<dt>) visually, so assistive tech reads "Vertical climbed: 132K ft".
 * Renders nothing when there are no totals (Owner decision D1: hide rather
 * than invent).
 */
export function ClubTotals({ totals }: { totals: ClubTotalsData | null }) {
  if (!totals || totals.items.length === 0) return null;

  const layout = fluidVars({
    "--totals-pt": [32, 32, 136.6],
    "--totals-pb": [64, 86, 121.8],
    "--totals-grid-mt": [38, 30, 76],
    "--totals-gap-x": [20, 24, 32],
    "--totals-label-mt": [6, 6, 12],
  });
  const heading = fluidType([32, 44, 64], [34, 46, 60.8]);
  const value = fluidType([48, 48, 96], [54, 54, 60.8]);
  const label = fluidType([13, 13, 16], [18, 18, 24]);
  const provisional = totals.status !== "verified";

  return (
    <section
      aria-labelledby="club-totals-heading"
      style={layout}
      className="bg-background text-foreground pt-(--totals-pt-a) pb-(--totals-pb-a) md:pt-(--totals-pt-b) md:pb-(--totals-pb-b)"
    >
      {/* One grid so the marker can sit beside the heading on desktop (Figma's empty
          slot) and below the figures on tablet/mobile, without moving any designed
          element or duplicating it for screen readers. */}
      <Container className="grid lg:grid-cols-[1fr_auto]">
        <h2 id="club-totals-heading" style={heading} className={cn(FLUID_TYPE, "font-black ss08")}>
          {totals.year} club totals.
        </h2>
        {provisional && (
          <ProvisionalBadge className="row-start-3 mt-8 justify-self-start lg:col-start-2 lg:row-start-1 lg:mt-0 lg:mb-1 lg:self-end">
            Provisional · unverified figures
          </ProvisionalBadge>
        )}

        <dl
          className={cn(
            "row-start-2 grid grid-cols-2 gap-y-[34px] md:grid-cols-4 lg:col-span-2",
            "mt-(--totals-grid-mt-a) gap-x-(--totals-gap-x-a) md:mt-(--totals-grid-mt-b) md:gap-x-(--totals-gap-x-b)",
          )}
        >
          {totals.items.map((item) => (
            <div key={item.label} className="flex min-w-0 flex-col">
              <dt
                style={label}
                className={cn(FLUID_TYPE, "order-2 mt-(--totals-label-mt-a) md:mt-(--totals-label-mt-b)")}
              >
                {item.label}
              </dt>
              <dd style={value} className={cn(FLUID_TYPE, "order-1 font-black tracking-[-0.02em] whitespace-nowrap")}>
                {item.value}
                {item.unit && <span className="text-[0.25em] leading-[0] tracking-[-0.04em]">{item.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
