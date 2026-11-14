import Image from "next/image";
import black from "@/components/brand/art/cmr-badge-black.png";
import white from "@/components/brand/art/cmr-badge-white.png";
import { cn } from "@/lib/utils";

/**
 * The CMR badge as a transparent image, for the Brand Standards (website and
 * PDF). The pixels are the approved badge's own (scripts/brand/derive-badge-art.mjs
 * derives them from the unmodified Figma mask), in one flat color with the
 * letters transparent, exactly as the site's masked badge renders.
 *
 * Why not the site's CmrLogo here: Chromium writes a CSS-masked box into a PDF
 * with a faint hairline along its edge, which showed as a rectangle around every
 * badge. The site itself keeps CmrLogo; this is the manual's drawing of the same mark.
 *
 *   ink="black"   black badge, for white, light and tinted grounds
 *   ink="white"   white badge, for black grounds
 */
export function BrandBadge({ ink = "black", className, decorative = false }: { ink?: "black" | "white"; className?: string; decorative?: boolean }) {
  return (
    <Image
      src={ink === "white" ? white : black}
      alt={decorative ? "" : "Chicago Mountain Runners"}
      width={1386}
      height={728}
      sizes="(min-width: 1024px) 420px, 60vw"
      data-slot="brand-badge"
      className={cn("block h-auto max-w-none", className)}
    />
  );
}
