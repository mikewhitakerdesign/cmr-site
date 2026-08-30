import { notFound } from "next/navigation";
import { getHill, hills } from "@/lib/hills";

export function generateStaticParams() {
  return hills.map((hill) => ({ slug: hill.slug }));
}

export default async function HillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hill = getHill(slug);
  if (!hill) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{hill.name}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{hill.neighborhood}</p>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-zinc-500">Elevation gain per repeat</dt>
          <dd className="font-medium">{hill.elevationGainFt} ft</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Repeat distance</dt>
          <dd className="font-medium">{hill.repeatDistanceMi} mi</dd>
        </div>
      </dl>
      <p className="max-w-xl">{hill.description}</p>
    </div>
  );
}
