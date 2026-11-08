import Image from "next/image";
import Link from "next/link";
import { ArrowLink } from "@/components/ArrowLink";
import { Container } from "@/components/Container";
import { ArrowUpRightIcon } from "@/components/icons";
import { ProvisionalBadge } from "@/components/ProvisionalBadge";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import type { Hill } from "@/lib/hills";
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
 *   - Mt. Trashmore's grey row (#ececec = `border` token) is read as "featured
 *     hill": the one whose profile is illustrated. Other rows use it on hover.
 *
 * The illustration is the approved Figma artwork, unaltered, offset up 8.96%
 * in its frame as in Figma. Its printed figures are unverified, so the empty
 * band that offset leaves carries a provisional marker.
 */
export function ChicagoHills({ hills }: { hills: Hill[] }) {
  const layout = fluidVars({
    "--hills-py": [56, 56, 128],
    "--hills-gap-x": [0, 48, 64],
    "--hills-h2-mt": [0, 0, 16],
    "--hills-link-mt": [32, 32, 33],
    "--hills-fig-mt": [20, 14, 0],
    "--hills-list-mt": [34, 34, 0],
  });
  const heading = fluidType([48, 54, 96], [48, 54, 88]);
  const copy = fluidType([16, 16, 18], [24, 24, 27]);
  const featured = hills.find((h) => h.profileIllustration);
  const illustration = featured?.profileIllustration;

  return (
    <section
      aria-labelledby="hills-heading"
      style={layout}
      className="bg-background text-foreground py-(--hills-py-a) md:py-(--hills-py-b)"
    >
      <Container>
        <div className="grid md:grid-cols-2 md:gap-x-(--hills-gap-x-b)">
          <div className="lg:max-w-[502px]">
            <h2
              id="hills-heading"
              style={heading}
              className={cn(FLUID_TYPE, "mt-(--hills-h2-mt-a) font-black tracking-[-0.04em] ss08 md:mt-(--hills-h2-mt-b)")}
            >
              Get high in the city.
            </h2>
            <p style={copy} className={cn(FLUID_TYPE, "mt-6 font-medium ss08 lg:max-w-[474px]")}>
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

          {featured && illustration && (
            <figure className="relative mt-(--hills-fig-mt-a) self-start md:mt-(--hills-fig-mt-b)">
              <div className="relative aspect-[1448/1086] overflow-hidden">
                <div className="absolute inset-0 -translate-y-[8.96%]">
                  <Image
                    src={illustration.src}
                    alt={illustration.alt}
                    fill
                    sizes="(min-width: 1400px) 620px, (min-width: 768px) 45vw, 100vw"
                    className="object-contain"
                  />
                </div>
              </div>
              {illustration.status !== "verified" && (
                <figcaption className="absolute right-0 bottom-0">
                  <ProvisionalBadge>Figures unverified</ProvisionalBadge>
                </figcaption>
              )}
            </figure>
          )}
        </div>

        {hills.length > 0 && (
          <ol className="mt-(--hills-list-mt-a) border-b border-foreground md:mt-(--hills-list-mt-b)">
            {hills.map((hill, i) => (
              <HillRow key={hill.slug} hill={hill} index={i + 1} featured={hill === featured} />
            ))}
          </ol>
        )}
      </Container>
    </section>
  );
}

function HillRow({ hill, index, featured }: { hill: Hill; index: number; featured: boolean }) {
  const name = fluidType([28, 32, 64], [36, 36, 60.8]);

  return (
    <li
      data-featured={featured || undefined}
      className={cn(
        "group/hill relative border-t border-foreground",
        "motion-safe:transition-colors motion-safe:duration-150 hover:bg-border data-featured:bg-border",
        // mobile: index gutter (text at 8px) + name/place stacked; 100 tall incl. the 1px rule
        "grid grid-cols-[32px_minmax(0,1fr)] gap-x-2 pt-[13px] pb-[22px]",
        // tablet: index at 0, name at 40; 96 tall incl. the rule
        "md:grid-cols-[24px_minmax(0,1fr)] md:gap-x-4 md:pb-[18px]",
        // desktop: one line, place right, ↗
        "lg:flex lg:items-center lg:gap-8 lg:py-6",
      )}
    >
      <span className="row-span-2 pt-2 pl-2 font-mono text-[13px] leading-5 md:pl-0 lg:pt-0 lg:text-p">
        {String(index).padStart(2, "0")}
      </span>
      <h3 style={name} className={cn(FLUID_TYPE, "min-w-0 font-semibold tracking-[-0.03em] lg:flex-1")}>
        <Link
          href={`/hills/${hill.slug}`}
          className={cn(
            "outline-none underline-offset-[0.12em] decoration-[0.04em] group-hover/hill:underline",
            "after:absolute after:inset-0 after:content-['']",
            "focus-visible:after:ring-3 focus-visible:after:ring-ring",
          )}
        >
          {hill.name}
        </Link>
      </h3>
      <p className="col-start-2 mt-2 text-[13px] leading-5 lg:mt-0 lg:shrink-0 lg:text-p">{hill.neighborhood}</p>
      <ArrowUpRightIcon
        className={cn(
          "hidden size-5 shrink-0 lg:block",
          "motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover/hill:translate-x-0.5 motion-safe:group-hover/hill:-translate-y-0.5",
        )}
      />
    </li>
  );
}
