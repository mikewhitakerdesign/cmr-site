import Image from "next/image";
import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { cn } from "@/lib/utils";

/**
 * "FLAT IS A STATE OF MIND." — Figma 1:376 (desktop), 78:355 (tablet),
 * 78:473 (mobile). White with the topographic line pattern (Figma image fill,
 * unaltered, `object-cover`; its 20% opacity is baked into the export) and a 1px
 * top rule at 40% black.
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
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* The exported fill already carries Figma's 20% layer opacity (black lines at
            alpha 51 → gray 204, measured against the Figma render), so no CSS opacity. */}
        <Image src="/home/topo-pattern.png" alt="" fill sizes="100vw" className="object-cover" />
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
