export interface Hill {
  slug: string;
  name: string;
  neighborhood: string;
  elevationGainFt: number;
  repeatDistanceMi: number;
  description: string;
}

// Placeholder data — replace with real CMR hill profiles before launch.
export const hills: Hill[] = [
  {
    slug: "example-hill",
    name: "Example Hill",
    neighborhood: "Placeholder Park",
    elevationGainFt: 40,
    repeatDistanceMi: 0.2,
    description:
      "Placeholder hill profile. Swap in a real Chicago hill (Cricket Hill, a flyover ramp, a parking garage — you know the ones) with real elevation and repeat numbers.",
  },
];

export function getHill(slug: string): Hill | undefined {
  return hills.find((hill) => hill.slug === slug);
}
