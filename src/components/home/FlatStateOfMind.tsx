import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { cn } from "@/lib/utils";
import { TopoPattern } from "@/components/home/TopoPattern";

/**
 * "FLAT IS A STATE OF MIND." — Figma 1:376 (desktop), 78:355 (tablet),
 * 78:473 (mobile). White with the topographic line pattern and a 1px top
 * rule at 40% black.
 *
 * Round 2 (Owner direction, 2026-11-08): the pattern is now vector — the Figma
 * fill traced to paths (scripts/assets/vectorize-topo.mjs). A liquid cursor
 * effect added in Round 2 was removed in Round 2.1 (Owner direction); the
 * background is static (TopoPattern).
 *
 *            height  lines                 vertical padding
 *   mobile   398     70/70 ×3              94
 *   tablet   514     110/108 ×3            95
 *   desktop  710     144/129.6 ×3          160.5
 *
 * Centered on the container (Figma's 1311px text box overhangs the desktop
 * container by 7px). Tracking −0.045em at every size (see JustShowUp).
 * A closing statement, not a section heading: rendered as a paragraph.
 */
export function FlatStateOfMind() {
  const layout = fluidVars({ "--flat-py": [94, 95, 160.5] });
  const statement = fluidType([70, 110, 144], [70, 108, 129.6]);

  return (
    <section
      style={layout}
      className="relative isolate border-t border-foreground/40 bg-background text-foreground py-(--flat-py-a) md:py-(--flat-py-b)"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <TopoPattern />
      </div>
      <Container>
        <p style={statement} className={cn(FLUID_TYPE, "text-center font-black tracking-[-0.045em]")}>
          <span className="block">FLAT IS</span> <span className="block">A STATE</span>{" "}
          <span className="block ss08">OF MIND.</span>
        </p>
      </Container>
    </section>
  );
}
