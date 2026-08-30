import { notFound } from "next/navigation";
import Link from "next/link";
import { getRun, runs } from "@/lib/runs";
import { getHill } from "@/lib/hills";

export function generateStaticParams() {
  return runs.map((run) => ({ slug: run.slug }));
}

export default async function RunPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const run = getRun(slug);
  if (!run) notFound();

  const hill = getHill(run.hillSlug);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{run.title}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        {run.date} · {run.time} · {run.meetupLocation}
      </p>
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
