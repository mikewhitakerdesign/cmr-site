import { participationGuidelines, privacyPolicy, websiteTerms } from "@/content/legal";
import { hillsWithPages } from "@/lib/hills";
import { OFFICIAL_RUNS_ON_HOLD } from "@/lib/permit-hold";
import { listedRuns } from "@/lib/runs";

/**
 * Paths that are real, indexable pages, in a stable order. Mirrors what each route serves:
 *   - a legal document is listed only once its text is published (an entry of `null` is noindex),
 *   - run pages exist only while official runs are not on hold and the run has content,
 *   - hill pages are the hills with page content (the same set as `generateStaticParams`),
 *   - the participant waiver is noindex and disabled, so it is never listed.
 * `held` and the inputs are parameters so tests can exercise both states.
 */
export function sitemapPaths({
  held = OFFICIAL_RUNS_ON_HOLD,
  legal = { privacy: privacyPolicy, terms: websiteTerms, guidelines: participationGuidelines },
  hills = hillsWithPages(),
  runs = listedRuns(),
}: {
  held?: boolean;
  legal?: { privacy: unknown; terms: unknown; guidelines: unknown };
  hills?: readonly { slug: string }[];
  runs?: readonly { slug: string; content?: unknown }[];
} = {}): string[] {
  return [
    "/",
    "/about",
    "/calendar",
    ...(held ? [] : runs.filter((r) => r.content).map((r) => `/calendar/${r.slug}`)),
    "/hills",
    ...hills.map((h) => `/hills/${h.slug}`),
    "/the-science",
    "/join",
    "/faq",
    ...(legal.privacy ? ["/privacy"] : []),
    ...(legal.terms ? ["/terms"] : []),
    ...(legal.guidelines ? ["/participation-guidelines"] : []),
  ];
}
