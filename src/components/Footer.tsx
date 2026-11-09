import Link from "next/link";
import { BackToTopLink } from "@/components/BackToTopLink";
import { CmrWordmark } from "@/components/CmrWordmark";
import { MotionToggle } from "@/components/MotionToggle";
import NewsletterSignup, { type NewsletterSignupProps } from "@/components/NewsletterSignup";
import { footerNav, legalLinks, riskNotice as defaultRiskNotice, type LegalLink, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export type FooterProps = {
  /**
   * Newsletter block props, or `false` to omit it (the default). Hidden for v1 (Owner direction,
   * 2026-11-09): no provider is chosen, and a disabled second signup beside the Join form was
   * confusing. Pass `{}` to bring the block back once a provider is configured.
   */
  newsletter?: NewsletterSignupProps | false;
  links?: NavItem[];
  /** Legal links; entries without an href are not rendered. */
  legal?: LegalLink[];
  riskNotice?: string;
  /** Copyright year; defaults to the current year at render time. */
  year?: number;
  className?: string;
};

const linkClass =
  "rounded-xs outline-none underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring";

/**
 * Footer — Figma "Footer / Newsletter and legal" (Desktop 1:314, Tablet 78:359,
 * Mobile 78:477), revised in homepage Round 2 (Owner direction, 2026-11-08):
 *
 *   - very light neutral surface (MWDS `muted`, #f5f5f5) instead of mint
 *   - everything in one neutral ink (`--cmr-quiet-ink`, ≈ #6c6c6c, 4.8:1 since the
 *     PR #4 final pass; it was #404040),
 *     including the newsletter input's text and its border (`--cmr-quiet-edge`,
 *     4.4:1 — a UI boundary needs 3:1); the submit stays the MWDS primary button
 *   - a tone-on-tone CMR logo above the newsletter heading, left-aligned
 *   - more vertical padding (80/96/128 top, 56/64/80 bottom) and a calmer rhythm:
 *     logo → newsletter → links → legal, separated by one hairline
 *
 * Chicago Hills refinement pass (Owner direction, 2026-11-08): the newsletter
 * takes the left half and the CMR wordmark (CmrWordmark, traced from the
 * Owner's reference image) fills the right half as one large block, in the
 * same quiet ink. Stacked below the newsletter on mobile. The small CMR badge
 * that sat above the newsletter is removed, so the footer carries one mark.
 *
 * Focus rings stay MWDS `focus/ring` (black) with the gap in the surface
 * color. Links and legal behavior are unchanged.
 */
export default function Footer({
  newsletter = false,
  links = footerNav,
  legal = legalLinks,
  riskNotice = defaultRiskNotice,
  year = new Date().getFullYear(),
  className,
}: FooterProps) {
  const visibleLegal = legal.filter((l): l is Required<LegalLink> => Boolean(l.href));

  return (
    <footer
      className={cn(
        "bg-muted text-(color:--cmr-quiet-ink) [--focus-offset:var(--muted)]",
        "border-t border-(color:--cmr-quiet-ink)/15",
        className,
      )}
    >
      <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-14 md:px-12 md:pt-24 md:pb-16 lg:pt-32 lg:pb-20">
        <div className="grid gap-y-14 md:grid-cols-2 md:items-start md:gap-x-12 lg:gap-x-16">
          {newsletter !== false && (
            <NewsletterSignup
              {...newsletter}
              className={newsletter.className}
              inputClassName={cn(
                "border-(color:--cmr-quiet-edge) text-(color:--cmr-quiet-ink) placeholder:text-(color:--cmr-quiet-ink)",
                newsletter.inputClassName,
              )}
            />
          )}
          {/* PR #4 final refinements: the wordmark takes you back to the top of the page. It sits left
              without the newsletter, and on the right of it when the newsletter returns. */}
          <BackToTopLink
            label="Chicago Mountain Runners, back to top"
            className={cn(
              "block w-full max-w-[640px] rounded-xs motion-safe:transition-opacity hover:opacity-80",
              newsletter !== false && "md:col-start-2 md:justify-self-end",
            )}
          >
            <CmrWordmark decorative className="w-full" />
          </BackToTopLink>
        </div>

        <div className="mt-14 border-t border-(color:--cmr-quiet-ink)/20 pt-8 md:mt-16 lg:mt-20 lg:flex lg:items-start lg:justify-between lg:gap-16">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:gap-x-8">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-p-sm font-medium lg:gap-x-8">
              {links.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <a href={item.href} className={linkClass}>
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          {/* Owner direction (2026-11-09): the motion control sits in this row, right of the links. */}
          <MotionToggle />
          </div>

          <div className="mt-8 max-w-[550px] lg:mt-0 lg:max-w-[448px]">
            {visibleLegal.length > 0 && (
              <ul aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 text-p-sm lg:gap-x-6">
                {visibleLegal.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className={cn("text-p-mini", visibleLegal.length > 0 && "mt-4")}>{riskNotice}</p>
            <p className="mt-3 text-p-mini">© {year} Chicago Mountain Runners</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
