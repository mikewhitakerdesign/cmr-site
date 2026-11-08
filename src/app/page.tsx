import { ClubTotals } from "@/components/home/ClubTotals";
import { CommunityIntro } from "@/components/home/CommunityIntro";
import { HomeHero } from "@/components/home/HomeHero";
import { UpcomingRuns } from "@/components/home/UpcomingRuns";
import { clubTotals } from "@/lib/club-totals";
import { getUpcomingRuns } from "@/lib/runs";

/**
 * Homepage — Figma Home / Desktop 1:10, Tablet 1:451, Mobile 1:884.
 * Header and Footer come from the root layout.
 *
 * The next run and upcoming list depend on the current Chicago time, so the
 * page is regenerated hourly (route segment `revalidate`; Cache Components is
 * not enabled). No client polling (Owner decision D5).
 */
export const revalidate = 3600;

export default function Home() {
  const now = new Date();
  const upcoming = getUpcomingRuns(now, 3);

  return (
    <>
      <HomeHero next={upcoming[0] ?? null} now={now} />
      <CommunityIntro />
      <ClubTotals totals={clubTotals} />
      <UpcomingRuns occurrences={upcoming} now={now} />
    </>
  );
}
