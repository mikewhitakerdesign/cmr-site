import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import type { HillWithPage } from "@/lib/hills";
import { cn } from "@/lib/utils";

/**
 * The lede — Figma "Section / A grassy lakefront hill…" 1:6699: one large
 * editorial sentence (36/34.2 → 64/60.8, max 896). Section padding 96 mobile,
 * 128 tablet and desktop.
 *
 * Refinement pass (Owner direction, 2026-11-08): the statement alone — the
 * grey standfirst and the visible provisional note are removed. The hill's
 * content status stays in the data and on the section as `data-status`.
 */
export function HillLede({ hill }: { hill: HillWithPage }) {
  const layout = fluidVars({ "--lede-py": [96, 128, 128] });
  const lede = fluidType([36, 36, 64], [34.2, 34.2, 60.8]);

  return (
    <section aria-label="Overview" data-status={hill.status} style={layout} className="py-(--lede-py-a) md:py-(--lede-py-b)">
      <Container>
        <p style={lede} className={cn(FLUID_TYPE, "max-w-[896px] font-black tracking-[-0.03em]")}>
          {hill.page.lede}
        </p>
      </Container>
    </section>
  );
}
