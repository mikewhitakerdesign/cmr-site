import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * CMR wordmark, reproduced from Figma "Brand / CMR logo" exactly as built
 * there: a solid art layer clipped by two masks (a full frame, and a
 * grayscale shape image in which white = visible). Figma's masks are
 * luminance masks that intersect, so CSS must say so explicitly — the CSS
 * defaults (alpha + additive) would render a solid rectangle.
 * Assets in /public/brand are the unmodified Figma exports.
 */
export function CmrLogo({ className }: { className?: string }) {
  return (
    <span className={cn("relative block shrink-0 overflow-hidden", className)}>
      <span
        className="absolute inset-[0_0.1%_0.18%_0.08%]"
        style={{
          maskImage: "url(/brand/cmr-logo-mask-frame.svg), url(/brand/cmr-logo-mask-shape.svg)",
          maskMode: "alpha, luminance",
          maskComposite: "intersect",
          maskSize: "100% 100%, 100% 100%",
          maskRepeat: "no-repeat",
        }}
      >
        <Image
          src="/brand/cmr-logo-art.png"
          alt="Chicago Mountain Runners"
          fill
          priority
          sizes="(min-width: 1024px) 188px, (min-width: 768px) 128px, 100px"
          className="pointer-events-none max-w-none object-fill"
        />
      </span>
    </span>
  );
}
