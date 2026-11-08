import type { ReactNode } from "react";
import type { HillProfileData, Point } from "@/lib/hill-profile";
import { cn } from "@/lib/utils";

/**
 * A hill's terrain illustration with its annotation system — homepage Round 2,
 * reusable on hill detail pages.
 *
 * The artwork is black-and-white vector (public/hills/*.svg: white fills, black lines, no grays). Annotations are HTML
 * on top, in restrained pastel chips joined to the artwork by hairline
 * leaders:
 *
 *   mint       Summit ≈ N ft
 *   peach      Base ≈ N ft
 *   blue       Total rise ≈ N ft — the legend, larger, top right
 *
 * Figures come from USGS 3DEP elevation data (see the generating script),
 * rounded to 5 ft and marked "≈". An interpretive profile (no measured data)
 * shows the same labels without numbers, and its caption says so. Prominence
 * is never shown: it was not computed.
 *
 * Small containers (< 28rem, e.g. the tablet column) keep only the summit and
 * the rise legend so labels never crowd the drawing; container queries, so it
 * adapts to wherever the component is placed. (Round 2.1 removed the
 * "Steepest side" tag.)
 */
export function HillProfile({
  name,
  profile,
  className,
  caption = true,
  annotated = true,
}: {
  name: string;
  profile: HillProfileData;
  className?: string;
  /** Show the provenance caption under the artwork. */
  caption?: boolean;
  /**
   * Draw the pastel labels and the rise legend. Off for small thumbnails (the
   * /hills directory), where the row states the figure in text and one shared
   * caption carries the provenance.
   */
  annotated?: boolean;
}) {
  const { anchors, figures, width: W, height: H } = profile;
  const ft = (n: number) => `≈ ${n} ft`;

  return (
    <figure className={cn("@container", className)} data-hill-profile={profile.interpretive ? "interpretive" : "measured"}>
      <div className="relative" style={{ aspectRatio: `${W} / ${H}` }}>
        {/* Decorative: the labels and caption carry the information. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- static vector art; the optimizer doesn't process SVG */}
        <img src={profile.src} alt="" width={W} height={H} loading="lazy" decoding="async" className="absolute inset-0 size-full" />

        {annotated && (
          <>
            <svg aria-hidden viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 size-full overflow-visible">
              <Leader from={anchors.summit} dx={-150} dy={-70} W={W} H={H} />
              <g className="hidden @[28rem]:inline">
                <Leader from={anchors.base} dx={-170} dy={40} W={W} H={H} />
              </g>
            </svg>

            <Chip at={anchors.summit} dx={-150} dy={-70} W={W} H={H} align="end" tone="mint">
              Summit{figures && <b className="font-semibold"> {ft(figures.summitFt)}</b>}
            </Chip>
            <Chip at={anchors.base} dx={-170} dy={40} W={W} H={H} align="end" tone="peach" className="hidden @[28rem]:inline-flex">
              Base{figures && <b className="font-semibold"> {ft(figures.baseFt)}</b>}
            </Chip>

            <div
              data-slot="rise-legend"
              className="absolute top-0 right-0 rounded-md bg-(color:--cmr-tint-blue-dye) px-2.5 py-1.5 text-right text-foreground @[28rem]:px-3.5 @[28rem]:py-2.5"
            >
              <p className="text-[10px] leading-3 font-medium tracking-[0.06em] uppercase @[28rem]:text-p-mini">Total rise</p>
              <p className="text-[20px] leading-6 font-black tracking-[-0.02em] @[28rem]:text-[30px] @[28rem]:leading-8">
                {figures ? ft(figures.riseFt) : <span className="text-[13px] leading-5 font-semibold tracking-normal @[28rem]:text-p">Not measured yet</span>}
              </p>
            </div>
          </>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-p-mini text-muted-foreground">
          {profile.interpretive
            ? `Illustrative shape: ${name} hasn't been located in elevation data yet, so no figures are shown. Vertical scale exaggerated.`
            : `${name}: shape and figures from USGS 3DEP elevation data, approximate. Vertical scale exaggerated.`}
        </figcaption>
      )}
    </figure>
  );
}

const TONES = {
  mint: "bg-(color:--cmr-tint-mint-dye)",
  peach: "bg-(color:--cmr-tint-peach-dye)",
} as const;

/** Label positioned `dx`,`dy` (viewBox units) from an anchor; `align` = which side meets the leader. */
function Chip({
  at,
  dx,
  dy,
  W,
  H,
  align,
  tone,
  className,
  children,
}: {
  at: Point;
  dx: number;
  dy: number;
  W: number;
  H: number;
  align: "start" | "end";
  tone: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}) {
  const left = ((at[0] * W + dx) / W) * 100;
  const top = ((at[1] * H + dy) / H) * 100;
  return (
    <p
      style={{ left: `${left}%`, top: `${top}%` }}
      className={cn(
        "absolute inline-flex -translate-y-1/2 items-baseline gap-1 rounded-md px-2 py-1 whitespace-nowrap text-foreground",
        "text-[11px] leading-4 font-medium @[28rem]:text-p-mini @[36rem]:text-p-sm",
        align === "end" ? "-translate-x-full" : "",
        TONES[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}

function Leader({ from, dx, dy, W, H }: { from: Point; dx: number; dy: number; W: number; H: number }) {
  const x = from[0] * W, y = from[1] * H;
  return (
    <>
      <path d={`M${x} ${y}L${x + dx} ${y + dy}`} stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <circle cx={x} cy={y} r={6} fill="currentColor" />
    </>
  );
}
