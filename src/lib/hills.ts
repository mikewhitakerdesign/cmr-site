import type { ContentStatus } from "@/lib/content-status";
import type { HillProfileData } from "@/lib/hill-profile";
import { hillProfiles } from "@/lib/hill-profiles.generated";

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
  status: ContentStatus;
}

/**
 * Hill records, in display order (the homepage numbers them 01–05).
 *
 * - `example-hill` is the scaffold placeholder (never shown on the homepage).
 * - The five named hills and their park · neighborhood labels are the approved
 *   Figma homepage (Chicago hills 1:142), verbatim. They are `provisional`:
 *   CMR's use of them and every measurement are unconfirmed, so no elevation or
 *   distance is recorded.
 * - Round 2 (2026-11-08): each listed hill has a terrain profile generated from
 *   USGS 3DEP elevation data (Warren Hill's is interpretive — no hill could be
 *   located in the data). It replaces the approved Mt. Trashmore raster, whose
 *   printed figures (604 / 669 / 65 ft) the data broadly supports (≈ 605 / 670
 *   / 60); its "prominence 85 ft" could not be checked and is no longer shown.
 */
const PROVISIONAL_DESCRIPTION =
  "Hill listed in the approved homepage design. Elevation, repeat distance and surface have not been measured or confirmed yet.";

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
    description: PROVISIONAL_DESCRIPTION,
    status: "provisional",
  },
  {
    slug: "warren-hill",
    name: "Warren Hill",
    neighborhood: "Warren Park · West Ridge",
    description: PROVISIONAL_DESCRIPTION,
    status: "provisional",
  },
  {
    slug: "horner-hill",
    name: "Horner Hill",
    neighborhood: "Horner Park · Irving Park",
    description: PROVISIONAL_DESCRIPTION,
    status: "provisional",
  },
  {
    slug: "schiller-hill",
    name: "Schiller Hill",
    neighborhood: "Schiller Woods",
    description: PROVISIONAL_DESCRIPTION,
    status: "provisional",
  },
  {
    slug: "mt-trashmore",
    name: "Mt. Trashmore",
    neighborhood: "Robert E. James Park · Evanston",
    description: PROVISIONAL_DESCRIPTION,
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
