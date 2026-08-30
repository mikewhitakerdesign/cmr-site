import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">
        Chicago Mountain Runners
      </h1>
      <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Chicago doesn&apos;t have mountains. We run hills anyway.
      </p>
      <div className="flex gap-4 text-sm font-medium">
        <Link href="/calendar" className="underline">
          See upcoming runs
        </Link>
        <Link href="/hills" className="underline">
          Browse the hills
        </Link>
      </div>
    </div>
  );
}
