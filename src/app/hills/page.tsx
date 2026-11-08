import Link from "next/link";
import { ProvisionalBadge } from "@/components/ProvisionalBadge";
import { hills } from "@/lib/hills";

export const metadata = { title: "Hills — Chicago Mountain Runners" };

// Scaffold page (not yet designed).
export default function HillsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Chicago&apos;s Mountains
      </h1>
      <p className="max-w-xl text-muted-foreground">
        Every hill Chicago has, which is to say every hill Chicago has built
        by accident or on purpose.
      </p>
      <ul className="flex flex-col divide-y divide-border">
        {hills.map((hill) => (
          <li key={hill.slug} className="flex flex-col gap-1 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/hills/${hill.slug}`} className="font-medium hover:underline">
                {hill.name}
              </Link>
              {hill.status !== "verified" && (
                <ProvisionalBadge>{hill.status === "placeholder" ? "Placeholder" : "Unverified"}</ProvisionalBadge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {hill.neighborhood}
              {hill.elevationGainFt !== undefined && <> · {hill.elevationGainFt} ft gain per repeat</>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
