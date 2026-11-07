import Link from "next/link";
import { CmrLogo } from "@/components/CmrLogo";
import { NavLink } from "@/components/NavLink";
import { joinCta, primaryNav, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export type HeaderProps = {
  /** Primary navigation items, in display order. */
  items?: NavItem[];
  /** The outlined call to action at the end of the bar. */
  cta?: NavItem;
  className?: string;
};

/**
 * Site navigation — Figma "Navigation" (Home / Desktop 1:436, Tablet 78:259,
 * Mobile 78:377). Positions below are the Figma measurements:
 *
 *   mobile  <768   logo 100w, CTA 110w; links on a second row, 13px, gap 12
 *   tablet  ≥768   logo 128w, CTA 128w; links row tucked 8px under the logo box
 *   desktop ≥1024  single row in a 1400px container: logo 188w · links (gap 36,
 *                  80% opacity) · CTA 150w at 18px
 *
 * Interaction states are not drawn in Figma; they use MWDS semantics:
 * hover underline (links) / ghost-hover fill (CTA), current page = full
 * opacity + underline, focus = 3px focus/ring.
 */
export default function Header({ items = primaryNav, cta = joinCta, className }: HeaderProps) {
  return (
    <header className={cn("bg-background text-foreground", className)}>
      <div
        className={cn(
          "mx-auto grid max-w-[1400px] grid-cols-[1fr_auto] items-start",
          "px-6 pt-3 pb-[22px] md:px-12 md:pt-[17px] md:pb-[26px]",
          "lg:flex lg:items-center lg:justify-between lg:py-3",
        )}
      >
        <Link
          href="/"
          className="justify-self-start rounded-xs outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
          <CmrLogo className="aspect-[188/98] w-[100px] md:w-[128px] lg:w-[188px]" />
        </Link>

        <nav aria-label="Primary" className="col-span-2 row-start-2 mt-[38px] md:-mt-2 lg:mt-0">
          <ul
            className={cn(
              "flex flex-wrap gap-x-3 gap-y-1 md:gap-x-6 lg:gap-x-9",
              // 13px on mobile is the Figma value; it is off the MWDS type scale.
              "text-[13px] leading-5 md:text-p-sm",
            )}
          >
            {items.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  className={cn(
                    "inline-block rounded-xs font-medium whitespace-nowrap outline-none lg:opacity-80",
                    "underline-offset-4 hover:underline",
                    "aria-[current=page]:underline aria-[current=page]:opacity-100",
                    "focus-visible:ring-3 focus-visible:ring-ring focus-visible:opacity-100",
                  )}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <NavLink
          href={cta.href}
          className={cn(
            "col-start-2 row-start-1 inline-flex h-9 items-center justify-center justify-self-end",
            "mt-1.5 md:mt-[15px] lg:mt-0",
            "w-[110px] md:w-[128px] lg:w-[150px]",
            "rounded-md border-2 border-foreground font-semibold",
            "text-p lg:text-p-lg",
            "transition-colors outline-none hover:bg-ghost-hover",
            "aria-[current=page]:bg-ghost-hover",
            "focus-visible:ring-3 focus-visible:ring-ring",
          )}
        >
          {cta.label}
        </NavLink>
      </div>
    </header>
  );
}
