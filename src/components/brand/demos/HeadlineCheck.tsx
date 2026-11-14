"use client";

import { useId, useState } from "react";
import { LABEL } from "@/components/brand/styles";
import { checkHeadline } from "@/lib/brand/voice";
import { cn } from "@/lib/utils";

const STARTERS = ["Bad weather. Good hills.", "Unleash Your Inner Mountain Warrior!", "New here? Good.", "Join Us For An Epic Journey"];

/**
 * Type a headline and see whether it sounds like CMR. The checks are the
 * written rules (src/lib/brand/voice.ts); it is a second opinion, not a judge.
 */
export function HeadlineCheck() {
  const [text, setText] = useState(STARTERS[0]);
  const id = useId();
  const checks = checkHeadline(text);
  const passed = checks.filter((c) => c.pass).length;

  return (
    <div data-slot="headline-check" className="grid gap-6 lg:grid-cols-2 lg:gap-10">
      <div>
        <label htmlFor={id} className={cn(LABEL, "mb-2 block text-foreground/65")}>
          Your headline
        </label>
        <input
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={80}
          className="h-12 w-full rounded-md border border-foreground bg-background px-4 text-p outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--focus-offset)"
        />
        <div role="group" aria-label="Try one" className="mt-3 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setText(s)}
              className="rounded-md border border-foreground/40 px-2.5 py-1 text-left text-[13px] leading-5 outline-none hover:border-foreground focus-visible:ring-3 focus-visible:ring-ring"
            >
              {s}
            </button>
          ))}
        </div>
        <p className="mt-8 min-h-[2.2em] text-[clamp(32px,5vw,56px)] leading-[1.02] font-black tracking-[-0.04em] text-balance break-words">{text || " "}</p>
      </div>
      <div aria-live="polite">
        <p className={cn(LABEL, "mb-2 flex justify-between text-foreground/65")}>
          <span>Checks</span>
          <span data-slot="headline-score" className="text-foreground">
            {passed} of {checks.length}
          </span>
        </p>
        <ul className="border-t border-foreground">
          {checks.map((c) => (
            <li key={c.id} data-pass={c.pass} className="grid grid-cols-[3.5rem_1fr] gap-x-3 border-b border-foreground/20 py-3">
              <span className={cn("font-mono text-[13px] leading-6 uppercase", !c.pass && "line-through opacity-60")}>{c.pass ? "Pass" : "Fail"}</span>
              <span>
                <span className="block text-p-sm font-semibold">{c.label}</span>
                <span className="block text-[13px] leading-5 text-foreground/70">{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
