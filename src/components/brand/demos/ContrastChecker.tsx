"use client";

import { useId, useState } from "react";
import { LABEL } from "@/components/brand/styles";
import { contrast, formatRatio, wcagGrade } from "@/lib/brand/color";
import { cn } from "@/lib/utils";

export type CheckerColor = { id: string; name: string; hex: string };

const SELECT =
  "h-10 w-full rounded-md border border-foreground bg-background px-3 text-p-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)";

/**
 * Pick any two palette colours and read the WCAG 2.2 contrast between them.
 * The ratio is computed (src/lib/brand/color.ts), so it is always the real
 * figure for the current token values.
 */
export function ContrastChecker({ colors, initialText, initialGround }: { colors: readonly CheckerColor[]; initialText: string; initialGround: string }) {
  const [textId, setTextId] = useState(initialText);
  const [groundId, setGroundId] = useState(initialGround);
  const ids = { text: useId(), ground: useId() };
  const text = colors.find((c) => c.id === textId) ?? colors[0];
  const ground = colors.find((c) => c.id === groundId) ?? colors[0];
  const ratio = contrast(text.hex, ground.hex);
  const grade = wcagGrade(ratio);

  const verdicts: [string, boolean][] = [
    ["Body text (4.5:1)", ratio >= 4.5],
    ["Large text, 24px+ (3:1)", ratio >= 3],
    ["Interface boundaries (3:1)", ratio >= 3],
  ];

  return (
    <div data-slot="contrast-checker" className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-10">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor={ids.text} className={cn(LABEL, "mb-2 block text-foreground/65")}>
            Text
          </label>
          <select id={ids.text} value={textId} onChange={(e) => setTextId(e.target.value)} className={SELECT}>
            {colors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.hex}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.ground} className={cn(LABEL, "mb-2 block text-foreground/65")}>
            Background
          </label>
          <select id={ids.ground} value={groundId} onChange={(e) => setGroundId(e.target.value)} className={SELECT}>
            {colors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.hex}
              </option>
            ))}
          </select>
        </div>
        <ul className="mt-1 border-t border-foreground/20">
          {verdicts.map(([label, pass]) => (
            <li key={label} className="flex items-baseline justify-between gap-4 border-b border-foreground/20 py-2.5 text-p-sm">
              <span>{label}</span>
              <span className={cn("font-mono text-[13px] uppercase", !pass && "line-through opacity-60")}>{pass ? "Pass" : "Fail"}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        // Announce the new result when a selection changes.
        aria-live="polite"
        style={{ backgroundColor: ground.hex, color: text.hex }}
        className="flex min-h-64 flex-col justify-between rounded-xl p-6 ring-1 ring-foreground/15 ring-inset md:p-8"
      >
        <p className="flex items-baseline justify-between gap-4 font-mono text-[13px] uppercase">
          <span>
            {text.name} on {ground.name}
          </span>
          <span data-slot="contrast-grade">{grade}</span>
        </p>
        <p>
          <span data-slot="contrast-ratio" className="block text-[64px] leading-none font-black tracking-[-0.04em] md:text-[96px]">
            {formatRatio(ratio)}
          </span>
          <span className="mt-4 block max-w-[38ch] text-[18px] leading-[27px]">The hill isn&apos;t going anywhere. Neither is this sentence, if you can read it.</span>
        </p>
      </div>
    </div>
  );
}
