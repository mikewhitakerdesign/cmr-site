import Link from "next/link";
import { ProvisionalBadge } from "@/components/ProvisionalBadge";
import { runs } from "@/lib/runs";
import { describeSchedule } from "@/lib/schedule";

export const metadata = { title: "Calendar | Chicago Mountain Runners" };

// Scaffold page (not yet designed). Lists every run with its schedule; records
// that are not verified say so.
export default function CalendarPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Upcoming Runs</h1>
      <ul className="flex flex-col divide-y divide-border">
        {runs.map((run) => (
          <li key={run.slug} className="flex flex-col gap-1 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/calendar/${run.slug}`} className="font-medium hover:underline">
                {run.title}
              </Link>
              {run.status !== "verified" && (
                <ProvisionalBadge>{run.status === "placeholder" ? "Placeholder" : "Sample · unconfirmed"}</ProvisionalBadge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {describeSchedule(run.schedule)} · {run.meetupLocation}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
