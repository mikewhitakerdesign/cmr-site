/**
 * Production origin. One constant feeds `metadataBase`, every canonical URL, the sitemap and robots.txt, so they
 * cannot disagree (the pattern methods.club uses). Change it and redeploy to move domains.
 *
 * www.chicagomountainrunners.com is canonical. chicagomountainrunners.com, hillsonhills.com and
 * www.hillsonhills.com 308-redirect to it at the Vercel domain level (project `cmr-site`), preserving path and
 * query; nothing in the application handles those hosts. See docs/deployment.md.
 */
export const SITE_ORIGIN = "https://www.chicagomountainrunners.com";

export const SITE_NAME = "Chicago Mountain Runners";

/** Absolute URL on the canonical origin. "/" is the bare origin, which is how Next renders the root canonical. */
export function absoluteUrl(path: string = "/"): string {
  return path === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
