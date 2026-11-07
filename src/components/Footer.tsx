import Link from "next/link";
import NewsletterSignup, { type NewsletterSignupProps } from "@/components/NewsletterSignup";
import { footerNav, legalLinks, riskNotice as defaultRiskNotice, type LegalLink, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export type FooterProps = {
  /** Newsletter block props, or `false` to omit it. */
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
 * Mobile 78:477) on the CMR accent surface (general/accent = cmr/mint/100).
 *
 * Desktop note: in Figma the desktop newsletter row sits in a 130px-tall frame
 * whose 322px grid overflows, so the form is painted over by the next section.
 * Code follows the grid's intent (form visible, 32px row gap) — see the
 * discrepancy log in .aiom/work/implement-cmr-mwds-foundation-and-shared-ui.md.
 */
export default function Footer({
  newsletter = {},
  links = footerNav,
  legal = legalLinks,
  riskNotice = defaultRiskNotice,
  year = new Date().getFullYear(),
  className,
}: FooterProps) {
  const visibleLegal = legal.filter((l): l is Required<LegalLink> => Boolean(l.href));

  return (
    <footer className={cn("bg-accent text-accent-foreground [--focus-offset:var(--accent)] lg:border-t lg:border-foreground", className)}>
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-12 lg:pt-[62px] lg:pb-16">
        {newsletter !== false && <NewsletterSignup {...newsletter} />}

        <nav aria-label="Footer" className={newsletter !== false ? "mt-12" : undefined}>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-p-sm font-medium lg:gap-x-8">
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

        <div className="mt-9 max-w-[550px] lg:mt-[35px] lg:max-w-[448px]">
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
          <p className={cn("text-p-mini", visibleLegal.length > 0 && "mt-4 lg:mt-2")}>{riskNotice}</p>
          <p className="mt-[18px] text-p-mini lg:mt-2">© {year} Chicago Mountain Runners</p>
        </div>
      </div>
    </footer>
  );
}
