import type { ContentStatus } from "@/lib/content-status";

export interface HillIllustration {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** The labelled figures in the artwork are unverified until this is `verified`. */
  status: ContentStatus;
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
  profileIllustration?: HillIllustration;
  status: ContentStatus;
}

/**
 * Hill records, in display order (the homepage numbers them 01–05).
 *
 * - `example-hill` is the scaffold placeholder (never shown on the homepage).
 * - The five named hills and their park · neighborhood labels are the approved
 *   Figma homepage (Chicago hills 1:142), verbatim. They are `provisional`:
 *   CMR's use of them and every measurement are unconfirmed, so no elevation or
 *   distance is recorded. The Mt. Trashmore illustration is the approved Figma
 *   artwork; its printed figures are unverified.
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
    profileIllustration: {
      src: "/home/mt-trashmore-profile.png",
      width: 1448,
      height: 1086,
      // Transcribes the artwork's labels; it asserts nothing beyond them.
      alt:
        "Illustrated 3D contour profile of Mt. Trashmore, labelled: base elevation 604 ft, summit elevation 669 ft, total height or rise 65 ft, prominence 85 ft. Gentler slopes with park loops on one side; a steep face popular for sledding and training on the other.",
      status: "provisional",
    },
  },
];

export function getHill(slug: string): Hill | undefined {
  return hills.find((hill) => hill.slug === slug);
}

/** Hills eligible for public listings: everything except scaffold placeholders. */
export const listedHills = (all: readonly Hill[] = hills) => all.filter((h) => h.status !== "placeholder");
