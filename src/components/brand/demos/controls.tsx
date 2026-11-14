"use client";

import type { ReactNode } from "react";
import { LABEL } from "@/components/brand/styles";
import { cn } from "@/lib/utils";

/**
 * A small set of exclusive choices, as the calendar's Week / Month switch is
 * built: real buttons with `aria-pressed`, in a labelled group.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className={cn(LABEL, "mb-2 text-foreground/65")}>{label}</p>
      <div role="group" aria-label={label} className="inline-flex flex-wrap rounded-md border border-foreground p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-9 rounded-sm px-3 text-p-sm font-medium outline-none motion-safe:transition-colors",
              "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)",
              value === o.value ? "bg-foreground text-background" : "hover:bg-foreground/10",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A labelled range input with its current value shown in mono. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = String,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className={cn(LABEL, "mb-2 flex justify-between text-foreground/65")}>
        <span>{label}</span>
        <span className="text-foreground">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={format(value)}
        className="h-6 w-full cursor-pointer accent-(--foreground) outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)"
      />
    </label>
  );
}
