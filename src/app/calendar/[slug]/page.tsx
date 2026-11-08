import { notFound } from "next/navigation";
import Link from "next/link";
import { ProvisionalBadge } from "@/components/ProvisionalBadge";
import { getRun, runs, workoutLabel } from "@/lib/runs";
import { hillsWithPages } from "@/lib/hills";
import { describeSchedule } from "@/lib/schedule";

export function generateStaticParams() {
  return runs.map((run) => ({ slug: run.slug }));
}

// Scaffold page (not yet designed).
export default async function RunPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const run = getRun(slug);
  if (!run) notFound();

  // Only hills with a page are linked (the scaffold placeholder hill has none).
  const hill = hillsWithPages().find((h) => h.slug === run.hillSlug);
  const workout = workoutLabel(run);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{run.title}</h1>
      {run.status !== "verified" && (
        <p>
          <ProvisionalBadge>{run.status === "placeholder" ? "Placeholder" : "Sample · unconfirmed"}</ProvisionalBadge>
        </p>
      )}
      <p className="text-muted-foreground">
        {describeSchedule(run.schedule)} · {run.meetupLocation}
      </p>
      {workout && <p className="text-sm">{workout}</p>}
      <p className="max-w-xl">{run.description}</p>
      {hill && (
        <p className="text-sm">
          Hill:{" "}
          <Link href={`/hills/${hill.slug}`} className="underline">
            {hill.name}
          </Link>
        </p>
      )}
    </div>
  );
}
