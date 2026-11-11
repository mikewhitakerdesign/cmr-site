import type { Metadata } from "next";
import { HillsOnPause } from "@/components/calendar/HillsOnPause";
import { FindHero } from "@/components/calendar/FindHero";
import { FirstTimer } from "@/components/calendar/FirstTimer";
import { RunCalendar, type CalendarRun } from "@/components/calendar/RunCalendar";
import { UpcomingList } from "@/components/calendar/UpcomingList";
import { WeatherGuidance } from "@/components/weather/WeatherGuidance";
import { parseCalendarState } from "@/lib/calendar";
import { getUpcomingWithStatus, listedRuns } from "@/lib/runs";
import { OFFICIAL_RUNS_ON_HOLD, PAUSE_COPY } from "@/lib/permit-hold";
import { toClubTime } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Hills on Repeat | Chicago Mountain Runners",
  description: OFFICIAL_RUNS_ON_HOLD
    ? PAUSE_COPY.description
    : "Find your next Chicago group run. Weekly hill repeats with Chicago Mountain Runners, all paces welcome, no registration.",
  alternates: { canonical: "/calendar" },
};

/**
 * Find a Run (Figma Find a Run / Month and Week). Dynamic: the upcoming list
 * and the calendar depend on today's date and on `?view=` / `?date=`. The
 * weather is fetched on the server and cached by the fetch layer.
 */
export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ view?: string; date?: string }> }) {
  // Permit-pending hold (src/lib/permit-hold.ts): the page hero (headline only) and the "Hills on pause."
  // section. No calendar, runs, upcoming list, weather (so no weather request) or first-timer section is
  // rendered, so nothing of them is in the DOM. Everything below is the unchanged calendar, restored by
  // setting OFFICIAL_RUNS_ON_HOLD to false.
  if (OFFICIAL_RUNS_ON_HOLD) {
    return (
      <>
        <FindHero held />
        <HillsOnPause />
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
    </>
  );
}
