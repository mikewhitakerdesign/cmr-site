import { cn } from "@/lib/utils";

/**
 * The CMR badge for the Brand Standards (website and PDF): the vector master
 * itself (public/brand/logos), black or white, with the letters transparent.
 * The same files are the ones the manual offers for download.
 *
 * Why not the site's CmrLogo here: Chromium writes a CSS-masked box into a PDF
 * with a faint hairline along its edge, which showed as a rectangle around every
 * badge. The site header keeps CmrLogo; this draws the same mark from its master.
 *
 *   ink="black"   black badge, for white, light and tinted grounds
 *   ink="white"   white badge, for black grounds
 */
export function BrandBadge({ ink = "black", className, decorative = false }: { ink?: "black" | "white"; className?: string; decorative?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- the vector master; the image optimizer does not process SVG
    <img
      src={`/brand/logos/cmr-badge-${ink}.svg`}
      alt={decorative ? "" : "Chicago Mountain Runners"}
      width={1341}
      height={587}
      data-slot="brand-badge"
      className={cn("block aspect-[1341.2/586.6] h-auto max-w-none", className)}
    />
  );
}
