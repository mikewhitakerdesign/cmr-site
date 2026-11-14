import { WORDMARK_PATH, WORDMARK_VIEWBOX } from "@/components/brand/wordmark-path";
import { cn } from "@/lib/utils";

/**
 * The CMR wordmark as inline vector, in the current text color, for use inside
 * the Brand Standards (website and PDF): the vector master, nothing redrawn.
 * The site's own footer keeps CmrWordmark (the earlier trace, drawn as a mask).
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
      className={cn("block aspect-[1857.8/887.2] fill-current", className)}
    >
      <path d={WORDMARK_PATH} />
    </svg>
  );
}
