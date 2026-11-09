import { CmrLogo } from "@/components/CmrLogo";
import { ctaLinkVariants } from "@/components/CtaLink";
import { HeaderShell } from "@/components/HeaderShell";
import { HomeLink } from "@/components/HomeLink";
import { NavLink } from "@/components/NavLink";
import { Tooltip } from "@/components/Tooltip";
import { JOIN_TOOLTIP, joinCta, primaryNav, type NavItem } from "@/lib/navigation";
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
 *   - The logo returns to the top when already on the homepage (HomeLink).
 *
 * Mobile (PR #4 final refinements, Owner direction 2026-11-09), below 768:
 *   - Two rows: logo + "Join the club" (64 tall), then the links, divided by a
 *     1px rule. Links are 15px (was 13), and each fills an equal-share cell the
 *     full 48px row tall, so the whole cell is the tap target. Cells grow from
 *     their content (flex-auto), so a fourth link ("The Science") fits without
 *     changing this component: add it to `primaryNav`.
 *   - Scrolling down slides the top row away and the link row stays pinned;
 *     scrolling up brings the top row back (HeaderShell sets `data-hide-top`).
 *     It is a transform on the bar, so nothing below moves. Focus on the logo
 *     or the CTA brings the row back. Reduced motion: no slide, instant.
 *   - No compact shrink on mobile (the slide replaces it); the compact bottom
 *     rule still appears.
 *
 *              logo  expanded → compact     CTA
 *   mobile     100                          110w
 *   tablet     128 → 96                     128w
 *   desktop    188 → 112 (bar 122 → 74 tall) 150w at 18px
 *
 * Interaction states use MWDS semantics: hover underline (links); the CTA is
 * the shared CtaLink `outline` variant (1px border like the bar's bottom rule,
 * hover flips to black); current page = full opacity + underline; focus = 3px
 * focus/ring, offset from the CTA fill (inset on the edge-to-edge mobile cells).
 */
export default function Header({ items = primaryNav, cta = joinCta, className }: HeaderProps) {
  return (
    <HeaderShell
      className={cn(
        // The bar's expanded heights (mobile 64 + 1 + 48 + 1, tablet 99.7, desktop 123) are kept
        // when the bar changes, so nothing below ever shifts, not even by a subpixel.
        "min-h-[114px] text-foreground md:min-h-[100px] lg:min-h-[123px]",
        className,
      )}
    >
      <div
        data-slot="header-bar"
        className={cn(
          "pointer-events-auto border-b border-transparent bg-background",
          "group-data-[compact]/header:border-foreground",
          "motion-safe:group-data-[animating]/header:transition-colors motion-safe:group-data-[animating]/header:duration-300",
          // Mobile: slide the top row out of view while scrolling down.
          "max-md:group-data-[hide-top]/header:-translate-y-16",
          "max-md:motion-safe:transition-transform max-md:motion-safe:duration-300 max-md:motion-safe:ease-out",
        )}
      >
        <div
          className={cn(
            "mx-auto grid max-w-[1400px] grid-cols-[1fr_auto] grid-rows-[64px_auto] items-center",
            "md:flex md:items-center md:gap-6 md:px-12 md:py-4 lg:gap-9 lg:py-3",
            "md:group-data-[compact]/header:py-2.5 lg:group-data-[compact]/header:py-2",
            shrink,
          )}
        >
          <HomeLink className="ml-6 justify-self-start rounded-xs outline-none focus-visible:ring-3 focus-visible:ring-ring md:mr-auto md:ml-0">
            <CmrLogo
              className={cn(
                "aspect-[188/98] w-[100px] md:w-[128px] lg:w-[188px]",
                "md:group-data-[compact]/header:w-[96px] lg:group-data-[compact]/header:w-[112px]",
                shrink,
              )}
            />
          </HomeLink>

          <nav aria-label="Primary" data-slot="primary-nav" className="col-span-2 row-start-2 border-t border-foreground md:border-0">
            <ul className="flex md:flex-wrap md:justify-end md:gap-x-6 lg:gap-x-9 text-[15px] leading-5 md:text-p-sm">
              {items.map((item) => (
                <li key={item.href} className="flex-auto md:flex-none">
                  <NavLink
                    href={item.href}
                    className={cn(
                      // Mobile: the whole 48px cell is the link.
                      "flex h-12 items-center justify-center px-2 font-medium whitespace-nowrap outline-none",
                      "focus-visible:ring-3 focus-visible:ring-ring max-md:focus-visible:ring-inset",
                      "md:inline-block md:h-auto md:rounded-xs md:px-0 lg:opacity-80",
                      "underline-offset-4 hover:underline hover:opacity-100",
                      "aria-[current=page]:underline aria-[current=page]:opacity-100",
                      "focus-visible:opacity-100",
                    )}
                  >
                    {/* One child: a flex container would drop the spaces around the struck "Hills". */}
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <Tooltip text={JOIN_TOOLTIP} side="bottom" align="end" className="col-start-2 row-start-1 mr-6 justify-self-end md:mr-0">
            <NavLink
              href={cta.href}
              className={cn(
                ctaLinkVariants({ variant: "outline" }),
                // Pure white at rest, on /join too (the current-page state keeps this white; hover still flips to black).
                "h-9 bg-background",
                "w-[110px] md:w-[128px] lg:w-[150px]",
                "text-p lg:text-p-lg",
              )}
            >
              {cta.label}
            </NavLink>
          </Tooltip>
        </div>
      </div>
    </HeaderShell>
  );
}
