import Link from "next/link";
import { getUpcomingRuns } from "@/lib/runs";

export const metadata = { title: "Calendar — Chicago Mountain Runners" };

export default function CalendarPage() {
  const runs = getUpcomingRuns();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Upcoming Runs</h1>
      <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
        {runs.map((run) => (
          <li key={run.slug} className="py-4">
            <Link href={`/calendar/${run.slug}`} className="font-medium hover:underline">
              {run.title}
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {run.date} · {run.time} · {run.meetupLocation}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
