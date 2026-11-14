import { WORDMARK_PATH, WORDMARK_VIEWBOX } from "@/components/brand/wordmark-path";
import { cn } from "@/lib/utils";

/**
 * The CMR wordmark as inline vector, in the current text color, for use inside
 * the Brand Standards (website and PDF). Same artwork and same proportions
 * (1858:888) as the site's CmrWordmark, which draws it as a mask; nothing is
 * redrawn. The site's own footer keeps CmrWordmark.
 */
export function BrandWordmark({ className, decorative = false }: { className?: string; decorative?: boolean }) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Chicago Mountain Runners"}
      aria-hidden={decorative || undefined}
      focusable="false"
      data-slot="cmr-wordmark"
      className={cn("block aspect-[1858/888] fill-current", className)}
    >
      <path d={WORDMARK_PATH} fillRule="evenodd" />
    </svg>
  );
}
