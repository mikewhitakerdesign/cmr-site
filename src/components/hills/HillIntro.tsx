import type { ReactNode } from "react";
import { Container } from "@/components/Container";
import { ProvisionalBadge } from "@/components/ProvisionalBadge";
import { EYEBROW } from "@/components/hills/styles";
import { isUnverified } from "@/lib/content-status";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { REPEAT_TARGETS_FT, repeatsTo, surfaceLabel, type HillWithPage } from "@/lib/hills";
import { cn } from "@/lib/utils";

/**
 * The lede — Figma "Section / A grassy lakefront hill…" 1:6699: one large
 * editorial sentence (36/34.2 → 64/60.8, max 896) and a grey standfirst.
 * Section padding 96 mobile, 128 tablet and desktop.
 *
 * Added (not in Figma): the content-status note (Owner decision D1) while the
 * hill is unverified. It says what kind of information the page holds, so
 * provisional copy, approximate figures and TBDs can't read as confirmed.
 */
export function HillLede({ hill }: { hill: HillWithPage }) {
  const layout = fluidVars({ "--lede-py": [96, 128, 128] });
  const lede = fluidType([36, 36, 64], [34.2, 34.2, 60.8]);
  const illustrative = hill.profile?.interpretive;

  return (
    <section aria-label="Overview" style={layout} className="py-(--lede-py-a) md:py-(--lede-py-b)">
      <Container>
        <p style={lede} className={cn(FLUID_TYPE, "max-w-[896px] font-black tracking-[-0.03em]")}>
          {hill.page.lede}
        </p>
        {hill.page.standfirst && <p className="max-w-[672px] pt-8 text-[18px] leading-[27px] text-muted-foreground">{hill.page.standfirst}</p>}
        {isUnverified(hill.status) && (
          <p data-slot="content-status" className="mt-6 flex max-w-[672px] flex-wrap items-baseline gap-x-2 gap-y-1 text-p-sm text-muted-foreground">
            <ProvisionalBadge className="text-foreground">Provisional</ProvisionalBadge>
            <span>
              Club details on this page are unconfirmed.{" "}
              {illustrative ? "The hill drawing is illustrative, with no figures." : "Elevation figures are approximate estimates from public elevation data."}{" "}
              TBD means not measured yet.
            </span>
          </p>
        )}
      </Container>
    </section>
  );
}

/**
 * The stats strip — Figma "Section / Elevation Gain" 1:6377: a black-ruled
 * band of five cells (label Geist Mono 14/21 uppercase grey; value Geist
 * semibold 24/28.8). Five columns on tablet and desktop, two on mobile; cells
 * px24 py40 inside the 1400 container (no side padding, as drawn).
 *
 * Values are the IA's required hill fields. Unmeasured ones say "TBD" as in
 * Figma; the repeat counts are derived from elevation gain per repeat
 * (`repeatsTo`) and stay TBD until it's measured. The approximate terrain rise
 * is not used for them — it's shown, labelled, in the profile below.
 */
export function HillStats({ hill }: { hill: HillWithPage }) {
  const surface = surfaceLabel(hill.page);
  const repeats = REPEAT_TARGETS_FT.map((t) => repeatsTo(t, hill.elevationGainFt));
  const cells: { label: ReactNode; value: string }[] = [
    {
      label: (
        <>
          Elevation gain<span className="sr-only"> per repeat</span>
        </>
      ),
      value: hill.elevationGainFt !== undefined ? `${hill.elevationGainFt} ft` : "TBD",
    },
    { label: "Repeat distance", value: hill.repeatDistanceMi !== undefined ? `${hill.repeatDistanceMi} mi` : "TBD" },
    { label: "Surface", value: surface ?? "TBD" },
    ...REPEAT_TARGETS_FT.map((t, i) => ({
      label: (
        <>
          {t.toLocaleString("en-US")} ft<span className="sr-only"> of climbing</span>
        </>
      ),
      value: repeats[i] !== undefined ? `${repeats[i]} repeats` : "TBD repeats",
    })),
  ];

  return (
    <section aria-label="Hill numbers" className="border-y border-foreground">
      <dl className="mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-5">
        {cells.map((c, i) => (
          <div key={i} data-slot="hill-stat" className="px-6 py-10">
            <dt className={cn(EYEBROW, "text-muted-foreground")}>{c.label}</dt>
            <dd className="pt-3 text-[24px] leading-[28.8px] font-semibold tracking-[-0.04em]">{c.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
