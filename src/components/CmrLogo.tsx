import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Figma's masks are luminance masks that intersect, so CSS must say so
 * explicitly — the CSS defaults (alpha + additive) would render a solid
 * rectangle.
 */
const logoMask: CSSProperties = {
  maskImage: "url(/brand/cmr-logo-mask-frame.svg), url(/brand/cmr-logo-mask-shape.svg)",
  maskMode: "alpha, luminance",
  maskComposite: "intersect",
  maskSize: "100% 100%, 100% 100%",
  maskRepeat: "no-repeat",
};

/**
 * CMR wordmark, reproduced from Figma "Brand / CMR logo" exactly as built
 * there: a solid art layer clipped by two masks (a full frame, and a
 * grayscale shape image in which white = visible).
 * Assets in /public/brand are the unmodified Figma exports.
 *
 *   tone="art"      the Figma art layer (near-black) — header, default
 *   tone="current"  the same masks over a solid fill in the current text
 *                   color, for tone-on-tone placements (footer, Round 2).
 *                   The art layer is near-solid black (channel max 64/255),
 *                   so this is the same mark in another color.
 */
export function CmrLogo({ className, tone = "art" }: { className?: string; tone?: "art" | "current" }) {
  return (
    <span className={cn("relative block shrink-0 overflow-hidden", className)}>
      <span className="absolute inset-[0_0.1%_0.18%_0.08%]" style={logoMask}>
        {tone === "art" ? (
          <Image
            src="/brand/cmr-logo-art.png"
            alt="Chicago Mountain Runners"
            fill
            loading="eager"
            sizes="(min-width: 1024px) 188px, (min-width: 768px) 128px, 100px"
            className="pointer-events-none max-w-none object-fill"
          />
        ) : (
          <span role="img" aria-label="Chicago Mountain Runners" className="absolute inset-0 bg-current" />
        )}
      </span>
    </span>
  );
}
