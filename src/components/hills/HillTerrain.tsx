import { Container } from "@/components/Container";
import { HillProfile } from "@/components/HillProfile";
import { BODY, EYEBROW, SECTION_HEADING, sectionHeading } from "@/components/hills/styles";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { REPEAT_TARGETS_FT, repeatsTo, type HillWithPage } from "@/lib/hills";
import { cn } from "@/lib/utils";

/**
 * "What goes up." — Figma "Section / Elevation profile · data pending" 1:6700
 * (desktop 523 | 732 columns, gap 48; tablet 260 | 364; mobile stacked, gap
 * 48; padding 112 mobile, 144 tablet and desktop).
 *
 * Figma leaves the desktop column empty ("data pending") and draws an
 * idealized dashed curve on tablet and mobile. Both are replaced by the hill's
 * approved terrain illustration (HillProfile, the homepage component, with its
 * pastel labels, rise legend and "Vertical scale exaggerated." caption) at
 * every size, per the milestone direction. The eyebrow says which kind of
 * drawing it is instead of "data pending".
 */
export function HillProfileSection({ hill }: { hill: HillWithPage }) {
  if (!hill.profile) return null;
  const layout = fluidVars({ "--terrain-py": [112, 144, 144] });
  const kind = hill.profile.interpretive ? "illustrative" : "approximate";

  return (
    <section aria-labelledby="profile-heading" style={layout} className="py-(--terrain-py-a) md:py-(--terrain-py-b)">
      <Container className="grid gap-12 md:grid-cols-[260fr_364fr] md:items-center lg:grid-cols-[523fr_732fr]">
        <div>
          <p className={cn(EYEBROW, "text-muted-foreground")}>Elevation profile · {kind}</p>
          <h2 id="profile-heading" style={sectionHeading()} className={cn(FLUID_TYPE, SECTION_HEADING, "pt-4")}>
            What goes up.
          </h2>
        </div>
        <HillProfile name={hill.name} profile={hill.profile} />
      </Container>
    </section>
  );
}

/**
 * "The mountain at Montrose." — Figma 1:6445: story column (heading, 18/27
 * copy at 70%, max 448) and "Know what you're running" spec rows (Geist Mono
 * label left, Geist medium value right, 45 tall, #e5e5e5 rules). Two equal
 * columns from tablet (gap 64), stacked on mobile. Padding 96.
 *
 * Variation: rows appear only for what is recorded; a hill with no recorded
 * surface shows one "Not recorded yet" row rather than four TBDs. Added (not
 * in Figma): the sources behind the geographic statements, so published facts
 * read differently from club voice.
 */
export function HillAbout({ hill }: { hill: HillWithPage }) {
  const { page } = hill;
  const rows: [string, string][] = [];
  if (page.surface) {
    rows.push(["Primary surface", page.surface.primary]);
    if (page.surface.secondary) rows.push(["Secondary surface", page.surface.secondary]);
  }
  if (page.exposure) rows.push(["Exposure", page.exposure]);
  if (page.terrainCharacter) rows.push(["Terrain character", page.terrainCharacter]);
  if (rows.length === 0) rows.push(["Surface", "Not recorded yet"]);

  return (
    <section aria-labelledby="about-heading" className="py-24">
      <Container className="grid gap-16 md:grid-cols-2">
        <div>
          <h2 id="about-heading" style={sectionHeading()} className={cn(FLUID_TYPE, SECTION_HEADING)}>
            {page.aboutHeading}
          </h2>
          <div className={cn(BODY, "max-w-[448px] space-y-5 pt-8 text-foreground/70")}>
            {page.about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {page.sources.length > 0 && (
            <div data-slot="hill-sources" className="mt-8 max-w-[448px] text-p-mini text-muted-foreground">
              <p className={cn(EYEBROW, "text-[12px] leading-5")}>Sources</p>
              <ul className="mt-1 space-y-1">
                {page.sources.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      rel="noopener noreferrer"
                      className="rounded-xs underline underline-offset-2 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h3 className={cn(EYEBROW, "text-muted-foreground")}>Know what you&apos;re running</h3>
          <dl className="pt-6">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 border-b border-border py-3 text-[14px] leading-5">
                <dt className="font-mono text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="pt-4 font-mono text-[14px] leading-5 text-muted-foreground">Surface conditions vary with weather.</p>
        </div>
      </Container>
    </section>
  );
}

/**
 * "Make it taller." — Figma 1:6701: heading (44/40.5 → 49.9/45.9 → 96/88.3,
 * −0.04em), standfirst, the two cumulative-gain counts (Geist Mono label,
 * Geist black 30/30), and the approved line drawing ("FieldDrawing", a
 * schematic repeat: base line, curve, hatching, rise arrow — no data).
 * Desktop 676 | 564 columns, tablet 332 | 276, gap 64; mobile stacked.
 *
 * Counts come from elevation gain per repeat (IA decision 7) and read
 * "TBD repeats" until it is measured, as in Figma.
 */
export function HillRepeats({ hill }: { hill: HillWithPage }) {
  const layout = fluidVars({ "--repeats-py": [112, 144, 144] });
  const heading = fluidType([44, 49.92, 96], [40.48, 45.93, 88.32]);
  const counted = hill.elevationGainFt !== undefined;

  return (
    <section aria-labelledby="repeats-heading" style={layout} className="py-(--repeats-py-a) md:py-(--repeats-py-b)">
      <Container className="grid gap-16 md:grid-cols-[332fr_276fr] md:items-center lg:grid-cols-[676fr_564fr]">
        <div className="min-w-0">
          <h2 id="repeats-heading" style={heading} className={cn(FLUID_TYPE, "font-black tracking-[-0.04em]")}>
            Make it taller.
          </h2>
          <p className={cn(BODY, "max-w-[448px] pt-6 text-muted-foreground")}>
            One repeat isn&apos;t much of a mountain. That&apos;s what the next repeat is for.
          </p>
          <dl className="flex gap-12 pt-10">
            {REPEAT_TARGETS_FT.map((t) => {
              const n = repeatsTo(t, hill.elevationGainFt);
              return (
                // Figma: two 164px columns, gap 48 (376px) — wider than the 345px mobile column, so they share it.
                <div key={t} className="min-w-0 max-w-[164px] flex-1 md:w-[164px] md:flex-none">
                  <dt className={cn(EYEBROW, "text-muted-foreground")}>
                    {t.toLocaleString("en-US")} ft<span className="sr-only"> of climbing</span>
                  </dt>
                  <dd className="pt-2 text-[30px] leading-[30px] font-black tracking-[-0.033em]">{n !== undefined ? `${n} repeats` : "TBD repeats"}</dd>
                </div>
              );
            })}
          </dl>
          {!counted && (
            <p className="max-w-[448px] pt-6 text-p-mini text-muted-foreground">
              Counted from the elevation gain of one repeat, once it&apos;s measured.
            </p>
          )}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- static vector art from Figma (FieldDrawing 1:6531) */}
        <img
          src="/hills/repeat-diagram.svg"
          alt=""
          width={564}
          height={231}
          loading="lazy"
          decoding="async"
          className="h-auto w-full max-w-[564px] justify-self-center md:justify-self-start"
        />
      </Container>
    </section>
  );
}
