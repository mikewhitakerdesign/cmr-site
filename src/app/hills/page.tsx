import Link from "next/link";
import { hills } from "@/lib/hills";

export const metadata = { title: "Hills — Chicago Mountain Runners" };

export default function HillsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Chicago&apos;s Mountains
      </h1>
      <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
        Every hill Chicago has, which is to say every hill Chicago has built
        by accident or on purpose.
      </p>
      <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
        {hills.map((hill) => (
          <li key={hill.slug} className="py-4">
            <Link href={`/hills/${hill.slug}`} className="font-medium hover:underline">
              {hill.name}
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {hill.neighborhood} · {hill.elevationGainFt} ft gain per repeat
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
