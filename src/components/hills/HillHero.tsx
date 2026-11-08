import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { TopoPattern } from "@/components/home/TopoPattern";
import { EYEBROW } from "@/components/hills/styles";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import type { HillWithPage } from "@/lib/hills";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * Hill hero — Figma "Hero / Cricket Hill original photo" 1:6673 (desktop),
 * 1:7007 (tablet), 1:7336 (mobile). Measured below the sticky header (Figma
 * draws the navigation over the hero):
 *
 *            height  eyebrow          h1          gradient
 *   mobile   540     white            48/46.8     0 → 70% black
 *   tablet   697     white            73/65.7     0 → 70% black
 *   desktop  844     mint (#ddffea)   144/129.6   40 → 70% black
 *
 * Variation: only Cricket Hill has an approved photograph (the Owner's own,
 * public/hills/cricket-hill-hero.jpg). The other hills get a shorter black
 * hero with the site's static topographic pattern — no stock or generated
 * imagery stands in for a hill nobody has photographed for CMR yet.
 *
 * Added (not in Figma): a breadcrumb back to /hills at the top, so the page
 * can be left without the header.
 */
export function HillHero({ hill }: { hill: HillWithPage }) {
  const photo = hill.page.hero;
  const layout = fluidVars(photo ? { "--hero-h": [540, 697, 844] } : { "--hero-h": [380, 460, 560] });
  const heading = fluidType([48, 72.96, 144], [46.8, 65.66, 129.6]);
  const eyebrow = [hill.neighborhood, hill.page.locality].filter(Boolean).join(" · ");

  return (
    <section
      aria-labelledby="hill-heading"
      style={layout}
      data-hero={photo ? "photo" : "drawn"}
      className={cn(
        "relative isolate flex flex-col bg-primary text-primary-foreground",
        "min-h-(--hero-h-a) md:min-h-(--hero-h-b)",
        onDarkSurface,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {photo ? (
          <>
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
              style={{ objectPosition: photo.position }}
            />
            <div className="absolute inset-0 bg-linear-to-b from-primary/0 to-primary/70 lg:from-primary/40" />
            {/* Added for the breadcrumb (not in Figma): a short shade under it, so it reads over pale sky. */}
            <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-primary/60 to-primary/0" />
          </>
        ) : (
          <TopoPattern className="text-primary-foreground/15" />
        )}
      </div>

      <Container className="flex flex-1 flex-col pt-6 pb-16 md:pt-8">
        <nav aria-label="Breadcrumb">
          <ol className={cn(EYEBROW, "flex flex-wrap gap-x-2 text-[12px] leading-5 md:text-[13px]")}>
            <li>
              <Link href="/hills" className="rounded-xs underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring">
                Chicago Mtns
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="opacity-80">
              {hill.name}
            </li>
          </ol>
        </nav>

        <div className="mt-auto pt-16">
          <p className={cn(EYEBROW, "max-w-[315px] lg:text-(color:--cmr-tint-mint-dye)")}>{eyebrow}</p>
          <h1 id="hill-heading" style={heading} className={cn(FLUID_TYPE, "pt-4 font-black tracking-[-0.045em] uppercase text-balance")}>
            {hill.name}
          </h1>
        </div>
      </Container>
    </section>
  );
}
