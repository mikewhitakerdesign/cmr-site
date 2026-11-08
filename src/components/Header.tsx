import { CmrLogo } from "@/components/CmrLogo";
import { ctaLinkVariants } from "@/components/CtaLink";
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
 *     less padding, and a 1px black bottom rule (no shadow). Only the visible bar
 *     shrinks; the header's layout box keeps its expanded height and is
 *     click-through, so page content never shifts (HeaderShell).
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
 * Interaction states use MWDS semantics: hover underline (links); the CTA is
 * the shared CtaLink `outline` variant (1px border like the bar's bottom rule,
 * hover flips to black); current page = full opacity + underline; focus = 3px
 * focus/ring, offset from the CTA fill.
 */
export default function Header({ items = primaryNav, cta = joinCta, className }: HeaderProps) {
  return (
    <HeaderShell
      className={cn(
        // The bar's expanded heights (mobile 137.125 — the logo's aspect ratio leaves a
        // fraction — tablet 99.7, desktop 123) are kept when the bar goes compact, so
        // nothing below ever shifts, not even by a subpixel.
        "min-h-[137.13px] text-foreground md:min-h-[100px] lg:min-h-[123px]",
        className,
      )}
    >
      <div
        data-slot="header-bar"
        className={cn(
          "pointer-events-auto border-b border-transparent bg-background",
          "group-data-[compact]/header:border-foreground",
          "motion-safe:group-data-[animating]/header:transition-colors motion-safe:group-data-[animating]/header:duration-300",
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
              ctaLinkVariants({ variant: "outline" }),
              "col-start-2 row-start-1 h-9 justify-self-end",
              "mt-1.5 md:mt-0 group-data-[compact]/header:mt-0.5 md:group-data-[compact]/header:mt-0",
              "w-[110px] md:w-[128px] lg:w-[150px]",
              "text-p lg:text-p-lg",
              // Current page keeps the light MWDS ghost fill; hover still flips it to black.
              "aria-[current=page]:bg-ghost-hover aria-[current=page]:hover:bg-primary",
            )}
          >
            {cta.label}
          </NavLink>
        </div>
      </div>
    </HeaderShell>
  );
}
