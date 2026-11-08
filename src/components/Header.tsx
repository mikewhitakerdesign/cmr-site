import { CmrLogo } from "@/components/CmrLogo";
import { HeaderShell } from "@/components/HeaderShell";
import { HomeLink } from "@/components/HomeLink";
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
 * Size changes animate together, only while the shell marks the compact toggle
 * (`data-animating`), so resizing the window never animates. Reduced motion
 * switches instantly.
 */
const shrink =
  "motion-safe:group-data-[animating]/header:transition-all motion-safe:group-data-[animating]/header:duration-300 motion-safe:group-data-[animating]/header:ease-out";

/**
 * Site navigation — Figma "Navigation" (Home / Desktop 1:436, Tablet 78:259,
 * Mobile 78:377), revised in homepage Round 2 (Owner direction, 2026-11-08):
 *
 *   - Sticky. Past the first ~100px of scroll it turns compact: smaller logo,
 *     less padding, and a 1px black bottom rule (no shadow).
 *   - Links sit on the right beside the CTA, one gap value between every item
 *     and the CTA (24px tablet, 36px desktop — Figma's link gaps).
 *   - Mobile keeps the links on a second row, right-aligned under the CTA.
 *   - The logo returns to the top when already on the homepage (HomeLink).
 *
 *              logo  expanded → compact     CTA
 *   mobile     100 → 72                     110w
 *   tablet     128 → 96                     128w
 *   desktop    188 → 112 (bar 122 → 74 tall) 150w at 18px
 *
 * Interaction states use MWDS semantics: hover underline (links) /
 * ghost-hover fill (CTA), current page = full opacity + underline,
 * focus = 3px focus/ring.
 */
export default function Header({ items = primaryNav, cta = joinCta, className }: HeaderProps) {
  return (
    <HeaderShell
      className={cn(
        "border-b border-transparent bg-background text-foreground",
        "data-[compact]:border-foreground",
        "motion-safe:data-[animating]:transition-colors motion-safe:data-[animating]:duration-300",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto grid max-w-[1400px] grid-cols-[1fr_auto] items-start",
          "px-6 pt-3 pb-[22px] md:flex md:items-center md:gap-6 md:px-12 md:py-4 lg:gap-9 lg:py-3",
          "group-data-[compact]/header:pt-2 group-data-[compact]/header:pb-2.5 md:group-data-[compact]/header:py-2.5 lg:group-data-[compact]/header:py-2",
          shrink,
        )}
      >
        <HomeLink className="justify-self-start rounded-xs outline-none focus-visible:ring-3 focus-visible:ring-ring md:mr-auto">
          <CmrLogo
            className={cn(
              "aspect-[188/98] w-[100px] md:w-[128px] lg:w-[188px]",
              "group-data-[compact]/header:w-[72px] md:group-data-[compact]/header:w-[96px] lg:group-data-[compact]/header:w-[112px]",
              shrink,
            )}
          />
        </HomeLink>

        <nav
          aria-label="Primary"
          className={cn(
            "col-span-2 row-start-2 mt-[30px] justify-self-end md:mt-0",
            "group-data-[compact]/header:mt-2 md:group-data-[compact]/header:mt-0",
            shrink,
          )}
        >
          <ul
            className={cn(
              "flex flex-wrap justify-end gap-x-3 gap-y-1 md:gap-x-6 lg:gap-x-9",
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
                    "underline-offset-4 hover:underline hover:opacity-100",
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
            "mt-1.5 md:mt-0 group-data-[compact]/header:mt-0.5 md:group-data-[compact]/header:mt-0",
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
    </HeaderShell>
  );
}
