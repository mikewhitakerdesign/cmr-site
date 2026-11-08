import type { ReactNode } from "react";
import { socialLinks, type SocialLinks } from "@/lib/social";

export type NavItem = {
  /** Visible label. May contain markup (e.g. the struck-through "Hills"). */
  label: ReactNode;
  href: string;
  /** Opens off-site; rendered as a plain <a>. */
  external?: boolean;
};

export type LegalLink = {
  label: string;
  /** Omit until the page exists; links without an href are not rendered. */
  href?: string;
};

/**
 * Primary navigation, per the approved CMR Figma (Home / Navigation).
 * Labels are Figma's; routes are the existing v1 routes (not renamed — see
 * .aiom/work/define-cmr-v1-ia-and-content-model.md, decision 3).
 *
 * Owner decision 2026-11-07: Figma's "Apparel" / "Shirts n' Stuff" item is
 * omitted — merch is out of v1 scope and has no route. Add it here once scoped.
 */
export const primaryNav: NavItem[] = [
  { label: "Find a Run", href: "/calendar" },
  {
    label: (
      <>
        Chicago <s>Hills</s> Mtns
      </>
    ),
    href: "/hills",
  },
  { label: "About", href: "/about" },
];

/** Header CTA. "Join the club" is the label of every Join CTA (header, hero, Just show up, footer). */
export const joinCta: NavItem = { label: "Join the club", href: "/join" };

/**
 * Footer link row, per Figma (Footer / Newsletter and legal). Instagram and
 * Strava appear only when a genuine destination is configured
 * (src/lib/social.ts); the row simply has fewer items otherwise.
 */
export function buildFooterNav(social: SocialLinks): NavItem[] {
  return [
    { label: "Find a Run", href: "/calendar" },
    { label: "About", href: "/about" },
    { label: "Join the club", href: "/join" },
    ...(social.instagram ? [{ label: "Instagram", href: social.instagram, external: true }] : []),
    ...(social.strava ? [{ label: "Strava", href: social.strava, external: true }] : []),
  ];
}

export const footerNav: NavItem[] = buildFooterNav(socialLinks);

/**
 * Owner decision 2026-11-07: legal pages are not authored yet, so these carry
 * no href and the footer hides them. Add the href when each page exists.
 */
export const legalLinks: LegalLink[] = [
  { label: "Privacy" },
  { label: "Terms" },
  { label: "Participation waiver" },
];

export const riskNotice =
  "Running carries inherent physical risk. Participate within your own limits and consult a physician before beginning any new training. Not medical advice.";
