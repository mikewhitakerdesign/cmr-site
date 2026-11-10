"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MOTION_EVENT, applyMotion, chooseMotion, currentMotion, storedMotion, type Motion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const subscribe = (cb: () => void) => {
  window.addEventListener(MOTION_EVENT, cb);
  return () => window.removeEventListener(MOTION_EVENT, cb);
};

/**
 * Footer control: "Pause motion" / "Resume motion" for the site's decorative
 * animation (src/lib/motion.ts). The label always names the action and the
 * state is announced when it changes. Follows the system reduced-motion
 * setting until the visitor chooses; the choice is then remembered here.
 */
export function MotionToggle({ className }: { className?: string }) {
  const motion = useSyncExternalStore<Motion>(subscribe, currentMotion, () => "on");
  const [announce, setAnnounce] = useState("");

  // Until a choice is made, follow the system setting if it changes while the page is open.
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => {
      if (!storedMotion()) applyMotion(mq.matches ? "off" : "on");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const on = motion === "on";
  return (
    <>
      <button
        type="button"
        data-slot="motion-toggle"
        data-motion-state={motion}
        onClick={() => {
          chooseMotion(on ? "off" : "on");
          setAnnounce(on ? "Motion paused." : "Motion resumed.");
        }}
        className={cn(
          "inline-flex items-center gap-2 rounded-xs text-p-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring",
          className,
        )}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
          {on ? (
            <>
              <path d="M5.5 3v10" />
              <path d="M10.5 3v10" />
            </>
          ) : (
            <path d="M4.5 3l8 5-8 5z" />
          )}
        </svg>
        {on ? "Pause motion" : "Resume motion"}
      </button>
      <span aria-live="polite" data-slot="motion-announce" className="sr-only">
        {announce}
      </span>
    </>
  );
}
