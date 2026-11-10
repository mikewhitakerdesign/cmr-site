import { ChicagoHills } from "@/components/home/ChicagoHills";
import { ClubTotals } from "@/components/home/ClubTotals";
import { CommunityIntro } from "@/components/home/CommunityIntro";
import { FlatStateOfMind } from "@/components/home/FlatStateOfMind";
import { HomeHero } from "@/components/home/HomeHero";
import { JustShowUp } from "@/components/home/JustShowUp";
import { UpcomingRuns } from "@/components/home/UpcomingRuns";
import { clubTotals } from "@/lib/club-totals";
import { listedHills } from "@/lib/hills";
import { OFFICIAL_RUNS_ON_HOLD, withoutHeldRuns } from "@/lib/permit-hold";
import { getNextOccurrencePerRun, getUpcomingRuns } from "@/lib/runs";

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
  // Permit-pending hold (src/lib/permit-hold.ts): no run, date or run link reaches the homepage.
  const next = withoutHeldRuns(getUpcomingRuns(now, 1))[0] ?? null;
  const upcoming = withoutHeldRuns(getNextOccurrencePerRun(now)) as ReturnType<typeof getNextOccurrencePerRun>;

  return (
    <>
      <HomeHero next={next} now={now} held={OFFICIAL_RUNS_ON_HOLD} />
      <CommunityIntro />
      <ClubTotals totals={clubTotals} />
      <UpcomingRuns occurrences={upcoming} now={now} />
      <ChicagoHills hills={listedHills().slice(0, 5)} />
      <JustShowUp />
      <FlatStateOfMind />
    </>
  );
}
