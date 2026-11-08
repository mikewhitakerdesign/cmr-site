import type { ContentStatus } from "@/lib/content-status";
import type { HillProfileData } from "@/lib/hill-profile";
import { hillProfiles } from "@/lib/hill-profiles.generated";

/** A published reference for a geographic statement (not an Owner verification). */
export type HillSource = { label: string; href: string };

/**
 * Detail-page content (Chicago Hills milestone, Figma Hill Details 1:6363 /
 * 1:6703 / 1:7032). Four kinds of information, kept apart on purpose:
 *
 *   sourced       geographic statements in `about`, backed by `sources`
 *                 (public pages, read 2026-11-08). Published, not Owner-verified.
 *   approximate   the terrain profile's figures (`Hill.profile`), from USGS 3DEP
 *                 elevation data, shown with "≈" and never used as repeat gain.
 *   illustrative  a profile with `interpretive: true` (Warren Hill).
 *   provisional   everything club-specific: the lede's voice, CMR's use of the
 *                 hill, surface and terrain notes taken from the Figma frame.
 *                 Visibly marked while the hill's `status` is not `verified`.
 *
 * Nothing here is a measured repeat distance, elevation gain per repeat,
 * meeting point, parking advice or CMR workout recommendation.
 */
export interface HillPage {
  /** The large editorial line under the hero (provisional voice). */
  lede: string;
  /** Optional grey line under the lede (Figma: Cricket Hill only). */
  standfirst?: string;
  /** "The mountain at Montrose." */
  aboutHeading: string;
  /** Paragraphs: geographic context (sourced) plus a line of CMR voice. */
  about: string[];
  /** References for the geographic statements in `about`. Empty = none could be read. */
  sources: HillSource[];
  /** Surface as recorded (provisional until verified). Unset = not recorded. */
  surface?: { primary: string; secondary?: string };
  /** Qualitative notes from the Figma frame (provisional). */
  exposure?: string;
  terrainCharacter?: string;
  /** Appended to the hero eyebrow after the neighborhood ("Chicago"). */
  locality?: string;
  /** "Find the mountain." address lines. Park-level only, never a meeting point. */
  address: string[];
  /** Place search for the map links. Goes to the park or landmark, not a meeting point. */
  mapQuery: string;
  /** The map placeholder's pin label. */
  mapLabel: string;
  /** Photograph for the hero. Unset = no approved photograph; the hero is drawn instead. */
  hero?: { src: string; width: number; height: number; position: string };
}

export interface Hill {
  slug: string;
  name: string;
  /** Location as displayed ("Montrose Beach · Uptown"). */
  neighborhood: string;
  /** Unknown until measured — never estimated. */
  elevationGainFt?: number;
  repeatDistanceMi?: number;
  description: string;
  /**
   * Terrain illustration and approximate figures from USGS elevation data
   * (Round 2; scripts/assets/terrain). Not Owner-verified measurements: the
   * hill's own `status` still governs, and `elevationGainFt` stays unset.
   */
  profile?: HillProfileData;
  /** Detail-page content. Every listed hill has one. */
  page?: HillPage;
  status: ContentStatus;
}

const CPD = (path: string, label: string): HillSource => ({
  label,
  href: `https://www.chicagoparkdistrict.com/parks-facilities/${path}`,
});

/**
 * Hill records, in display order (the homepage and /hills number them 01–05).
 *
 * - `example-hill` is the scaffold placeholder (never listed, no page).
 * - The five named hills and their park · neighborhood labels are the approved
 *   Figma homepage (Chicago hills 1:142), verbatim. They are `provisional`:
 *   CMR's use of them and every measurement are unconfirmed, so no elevation
 *   gain per repeat or repeat distance is recorded.
 * - Round 2 (2026-11-08): each listed hill has a terrain profile generated from
 *   USGS 3DEP elevation data (Warren Hill's is interpretive — no hill could be
 *   located in the data). Mt. Trashmore's approved raster printed 604 / 669 /
 *   65 ft, which the data broadly supports (≈ 605 / 670 / 60).
 * - Chicago Hills milestone (2026-11-08): detail-page content. Cricket Hill's
 *   lede, standfirst, "The mountain at Montrose." copy, surface and terrain
 *   notes are the approved Hill Details frame, verbatim (provisional), plus one
 *   sourced sentence. The other four have no frame of their own: their copy
 *   states only what the cited pages say, plus a line of CMR voice, and
 *   records no surface. Published heights differ from the terrain estimates
 *   (WBEZ: Cricket Hill is "45-foot-tall"; the data: ≈ 30 ft of rise above the
 *   surrounding ground); pages show only the approximate rise, labelled.
 */
export const hills: Hill[] = [
  {
    slug: "example-hill",
    name: "Example Hill",
    neighborhood: "Placeholder Park",
    elevationGainFt: 40,
    repeatDistanceMi: 0.2,
    description:
      "Placeholder hill profile. Swap in a real Chicago hill (Cricket Hill, a flyover ramp, a parking garage — you know the ones) with real elevation and repeat numbers.",
    status: "placeholder",
  },
  {
    slug: "cricket-hill",
    name: "Cricket Hill",
    neighborhood: "Montrose Beach · Uptown",
    description:
      "A grassy lakefront hill beside Montrose Harbor with just enough elevation to become considerably less charming after enough repeats.",
    page: {
      lede: "A grassy lakefront hill beside Montrose Harbor with just enough elevation to become considerably less charming after enough repeats.",
      standfirst: "One of Chicago Mountain Runners' primary training hills.",
      aboutHeading: "The mountain at Montrose.",
      about: [
        "Cricket Hill sits just west of Montrose Harbor along Chicago's lakefront. In another city, it might be a pleasant little hill.",
        "Here, we have standards to maintain.",
        "Its open grassy slope and surrounding paths make it useful for short climbs, repeat workouts and accumulating vertical without leaving the city.",
        "The Park District decided to build it in 1948, as an artificial sledding hill on its new lakefront landfill at Montrose.",
      ],
      sources: [
        CPD("cricket-hill", "Chicago Park District: Cricket Hill"),
        {
          label: "WBEZ Curious City: How did Cricket Hill get its name?",
          href: "https://www.wbez.org/stories/how-did-cricket-hill-in-chicago-get-its-name/369e3b9b-4b90-4abe-a47c-a4e606df0b50",
        },
      ],
      surface: { primary: "Grass", secondary: "Paved path" },
      exposure: "Open",
      terrainCharacter: "Short, repeatable climb",
      locality: "Chicago",
      address: ["Cricket Hill", "Montrose Beach", "Chicago, Illinois"],
      mapQuery: "Cricket Hill, 4500 N Lake Shore Dr, Chicago, IL",
      mapLabel: "Cricket Hill · Montrose Beach",
      hero: { src: "/hills/cricket-hill-hero.jpg", width: 1920, height: 1600, position: "50% 30%" },
    },
    status: "provisional",
  },
  {
    slug: "warren-hill",
    name: "Warren Hill",
    neighborhood: "Warren Park · West Ridge",
    description:
      "A park hill in West Ridge that our elevation data hasn't found yet. The sledders seem confident it exists.",
    page: {
      lede: "A park hill in West Ridge that our elevation data hasn't found yet. The sledders seem confident it exists.",
      aboutHeading: "The hill at Warren Park.",
      about: [
        "Warren Park covers about 89 acres on Western Avenue, with a nine-hole golf course and an ice rink.",
        "We haven't located the hill in elevation data yet. The drawing on this page is a stand-in, not a survey, so it carries no numbers.",
      ],
      sources: [CPD("warren-laurence-park", "Chicago Park District: Warren (Laurence) Park")],
      locality: "Chicago",
      address: ["Warren Park", "6601 N. Western Ave.", "Chicago, Illinois"],
      mapQuery: "Warren Park, 6601 N Western Ave, Chicago, IL",
      mapLabel: "Warren Hill · Warren Park",
    },
    status: "provisional",
  },
  {
    slug: "horner-hill",
    name: "Horner Hill",
    neighborhood: "Horner Park · Irving Park",
    description:
      "A tobogganing hill in Irving Park, on a site that went from clay pits to a dump to a park. Chicago makes its mountains out of whatever is lying around.",
    page: {
      lede: "A tobogganing hill in Irving Park, on a site that went from clay pits to a dump to a park. Chicago makes its mountains out of whatever is lying around.",
      aboutHeading: "The hill at Horner Park.",
      about: [
        "Horner Park sits at Montrose and California Avenues in Irving Park. The Park District's history says its clay pits became a garbage dump before the land was filled and graded into a park, and that by the early 1950s it had a large tobogganing hill.",
        "Not tall. Not nothing.",
      ],
      sources: [CPD("horner-henry-park", "Chicago Park District: Horner (Henry) Park")],
      locality: "Chicago",
      address: ["Horner Park", "2741 W. Montrose Ave.", "Chicago, Illinois"],
      mapQuery: "Horner Park, 2741 W Montrose Ave, Chicago, IL",
      mapLabel: "Horner Hill · Horner Park",
    },
    status: "provisional",
  },
  {
    slug: "schiller-hill",
    name: "Schiller Hill",
    neighborhood: "Schiller Woods",
    description:
      "A forest preserve sledding hill on the city's northwest edge. Modest, as mountains go. That's what repeats are for.",
    page: {
      lede: "A forest preserve sledding hill on the city's northwest edge. Modest, as mountains go. That's what repeats are for.",
      aboutHeading: "The hill at Schiller Woods.",
      about: [
        "Schiller Woods is a Forest Preserves of Cook County site along Irving Park Road. The hill's exact spot still needs confirming: the drawing on this page comes from the highest ground the elevation data could find in the woods.",
        "Bring your own sense of scale.",
      ],
      // The Forest Preserves pages refused automated reads (2026-11-08), so no source is cited.
      sources: [],
      address: ["Schiller Woods", "Irving Park Rd.", "Forest Preserves of Cook County"],
      mapQuery: "Schiller Woods, Irving Park Rd, Chicago, IL",
      mapLabel: "Schiller Hill · Schiller Woods",
    },
    status: "provisional",
  },
  {
    slug: "mt-trashmore",
    name: "Mt. Trashmore",
    neighborhood: "Robert E. James Park · Evanston",
    description:
      "A former Evanston landfill, closed in 1965 and promoted to mountain. Garbage, it turns out, stacks well.",
    page: {
      lede: "A former Evanston landfill, closed in 1965 and promoted to mountain. Garbage, it turns out, stacks well.",
      aboutHeading: "The mountain at James Park.",
      about: [
        "Mt. Trashmore rises in Robert E. James Park in Evanston. It was a solid-waste landfill until 1965, when it was closed and turned into a park, and it has been a popular sledding hill since. From 1973 it was briefly a ski slope, tow rope included.",
        "Every mountain range needs a backstory. This one's is municipal waste.",
      ],
      sources: [{ label: "Wikipedia: Mount Trashmore (Illinois)", href: "https://en.wikipedia.org/wiki/Mount_Trashmore_(Illinois)" }],
      address: ["Robert E. James Park", "Evanston, Illinois"],
      mapQuery: "Robert E. James Park, Evanston, IL",
      mapLabel: "Mt. Trashmore · James Park",
    },
    status: "provisional",
  },
];

for (const hill of hills) hill.profile ??= hillProfiles[hill.slug];

/** The hill the homepage shows first (Owner direction, Round 2). */
export const DEFAULT_PROFILE_SLUG = "mt-trashmore";

export function getHill(slug: string): Hill | undefined {
  return hills.find((hill) => hill.slug === slug);
}

/** Hills eligible for public listings: everything except scaffold placeholders. */
export const listedHills = (all: readonly Hill[] = hills) => all.filter((h) => h.status !== "placeholder");

export type HillWithPage = Hill & { page: HillPage };

/** Hills with a public detail page: listed hills that have page content, in display order. */
export const hillsWithPages = (all: readonly Hill[] = hills): HillWithPage[] =>
  listedHills(all).filter((h): h is HillWithPage => h.page !== undefined);

/** Cumulative-gain targets for the derived repeat counts (IA decision 7). */
export const REPEAT_TARGETS_FT = [500, 1000] as const;

/**
 * Repeats needed to reach `targetFt` of cumulative gain, from the measured
 * elevation gain per repeat (IA decision 7: derived, never stored). Undefined
 * while the gain per repeat is unmeasured — the approximate terrain rise is
 * deliberately NOT used, because a repeat need not climb the whole hill.
 */
export function repeatsTo(targetFt: number, gainPerRepeatFt: number | undefined): number | undefined {
  if (gainPerRepeatFt === undefined || !(gainPerRepeatFt > 0)) return undefined;
  return Math.ceil(targetFt / gainPerRepeatFt);
}

/** "Grass / paved path", or undefined when no surface is recorded. */
export function surfaceLabel(page: Pick<HillPage, "surface"> | undefined): string | undefined {
  const s = page?.surface;
  if (!s) return undefined;
  return s.secondary ? `${s.primary} / ${s.secondary.toLowerCase()}` : s.primary;
}

/** The other hills with pages, starting after `slug` and wrapping (detail-page "More hills"). */
export function otherHills(slug: string, all: readonly HillWithPage[] = hillsWithPages()): HillWithPage[] {
  const i = all.findIndex((h) => h.slug === slug);
  if (i < 0) return [...all];
  return [...all.slice(i + 1), ...all.slice(0, i)];
}
