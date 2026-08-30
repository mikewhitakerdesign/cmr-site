export interface Run {
  slug: string;
  title: string;
  hillSlug: string;
  date: string; // ISO date, e.g. "2026-09-05"
  time: string;
  meetupLocation: string;
  description: string;
}

// Placeholder data — replace with the real upcoming-runs schedule before launch.
export const runs: Run[] = [
  {
    slug: "example-hill-repeats",
    title: "Example Hill Repeats",
    hillSlug: "example-hill",
    date: "2026-09-05",
    time: "6:30 AM",
    meetupLocation: "Placeholder Park entrance",
    description:
      "Placeholder run. Swap in a real recurring or one-off CMR group run once the schedule is set.",
  },
];

export function getRun(slug: string): Run | undefined {
  return runs.find((run) => run.slug === slug);
}

export function getUpcomingRuns(): Run[] {
  return [...runs].sort((a, b) => a.date.localeCompare(b.date));
}
