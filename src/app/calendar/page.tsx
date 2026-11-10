import type { Metadata } from "next";
import { CommunityCta } from "@/components/calendar/CommunityCta";
import { PermitHold } from "@/components/calendar/PermitHold";
import { FindHero } from "@/components/calendar/FindHero";
import { FirstTimer } from "@/components/calendar/FirstTimer";
import { HillsLink } from "@/components/calendar/HillsLink";
import { RunCalendar, type CalendarRun } from "@/components/calendar/RunCalendar";
import { UpcomingList } from "@/components/calendar/UpcomingList";
import { WeatherGuidance } from "@/components/weather/WeatherGuidance";
import { parseCalendarState } from "@/lib/calendar";
import { getUpcomingWithStatus, listedRuns } from "@/lib/runs";
import { OFFICIAL_RUNS_ON_HOLD } from "@/lib/permit-hold";
import { toClubTime } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Find a Run | Chicago Mountain Runners",
  description: OFFICIAL_RUNS_ON_HOLD
    ? "Official group runs are on hold while we review park-use requirements. Explore Chicago's hills and join the club for updates."
    : "Pick a hill. Show up. Weekly hill repeats in Chicago, all paces welcome, no registration.",
};

/**
 * Find a Run (Figma Find a Run / Month and Week). Dynamic: the upcoming list
 * and the calendar depend on today's date and on `?view=` / `?date=`. The
 * weather is fetched on the server and cached by the fetch layer.
 */
export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ view?: string; date?: string }> }) {
  // Permit-pending hold (src/lib/permit-hold.ts): no calendar, no runs, no weather fetch.
  if (OFFICIAL_RUNS_ON_HOLD) {
    return (
      <>
        <PermitHold />
        <HillsLink />
        <CommunityCta />
      </>
    );
  }

  const now = new Date();
  const today = toClubTime(now).date;
  const { view, date } = parseCalendarState(await searchParams, today);

  const runs: CalendarRun[] = listedRuns().map((r) => ({
    slug: r.slug,
    title: r.title,
    meetupLocation: r.meetupLocation,
    durationLabel: r.durationLabel,
    description: r.summary ?? r.description,
    status: r.status,
    schedule: r.schedule,
  }));

  return (
    <>
      <FindHero now={now} />
      <UpcomingList rows={getUpcomingWithStatus(now)} />
      <RunCalendar runs={runs} today={today} initialView={view} initialDate={date} />
      <WeatherGuidance className="border-t border-foreground/15" />
      <FirstTimer />
      <HillsLink />
      <CommunityCta />
    </>
  );
}
