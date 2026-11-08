"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

/**
 * Link to the homepage. Already on the homepage, a plain click returns to the
 * top (smoothly unless the visitor prefers reduced motion) instead of doing
 * nothing; modified clicks (new tab, etc.) keep their browser behavior.
 */
export function HomeLink({ onClick, ...props }: Omit<ComponentProps<typeof Link>, "href">) {
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (pathname !== "/" || e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (window.location.hash) window.history.replaceState(window.history.state, "", "/");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <Link
      href="/"
      aria-current={pathname === "/" ? "page" : undefined}
      onClick={handleClick}
      {...props}
    />
  );
}
