"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/brand/icons";
import { contrast } from "@/lib/brand/color";
import { cn } from "@/lib/utils";

export type SwatchColor = { name: string; hex: string; cssVar: string };

/**
 * A colour, drawn with the site's own custom property (so it is the token, not
 * a copy of it) and labelled with the value that property resolves to. Click or
 * press Enter to copy the HEX. In the PDF it is the same block without the
 * copy affordance.
 */
export function Swatch({
  color,
  className,
  detail,
  compact = false,
}: {
  color: SwatchColor;
  className?: string;
  /** A second line under the value (a role, an RGB triple). */
  detail?: string;
  /** Name and value only, smaller: for ramps. */
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Black or white label, whichever reads better on this colour.
  const ink = contrast(color.hex, "#000000") >= contrast(color.hex, "#ffffff") ? "#000000" : "#ffffff";
  const light = contrast(color.hex, "#ffffff") < 1.25;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard unavailable (permissions, insecure origin): the value is printed on the swatch. */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      data-slot="brand-swatch"
      data-hex={color.hex}
      style={{ backgroundColor: `var(--${color.cssVar})`, color: ink }}
      className={cn(
        "group/sw relative flex min-h-24 w-full flex-col justify-end rounded-lg text-left outline-none",
        compact ? "p-2.5" : "p-4",
        light && "ring-1 ring-foreground/15 ring-inset",
        "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-2.5 right-2.5 opacity-0 group-hover/sw:opacity-100 group-focus-visible/sw:opacity-100 motion-safe:transition-opacity [.brand-print_&]:hidden",
          copied && "opacity-100",
        )}
      >
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      </span>
      <span className={cn("block font-semibold", compact ? "text-[12px] leading-4" : "text-p-sm")}>{color.name}</span>
      <span className={cn("block font-mono uppercase", compact ? "text-[11px] leading-4" : "text-[13px] leading-5")}>{color.hex}</span>
      {detail && !compact && <span className="mt-0.5 block text-[12px] leading-4 opacity-80">{detail}</span>}
      <span className="sr-only">. Copy the HEX value.</span>
      <span role="status" className="sr-only">
        {copied ? `Copied ${color.hex}` : ""}
      </span>
    </button>
  );
}
