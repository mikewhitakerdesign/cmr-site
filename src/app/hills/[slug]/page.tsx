import { notFound } from "next/navigation";
import { HillProfile } from "@/components/HillProfile";
import { ProvisionalBadge } from "@/components/ProvisionalBadge";
import { getHill, hills } from "@/lib/hills";

export function generateStaticParams() {
  return hills.map((hill) => ({ slug: hill.slug }));
}

const NOT_MEASURED = "Not measured yet";

// Scaffold page (not yet designed). Unknown measurements are shown as such,
// never estimated.
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
      {hill.status !== "verified" && (
        <p>
          <ProvisionalBadge>{hill.status === "placeholder" ? "Placeholder" : "Unverified"}</ProvisionalBadge>
        </p>
      )}
      <p className="text-muted-foreground">{hill.neighborhood}</p>
      {hill.profile && <HillProfile name={hill.name} profile={hill.profile} className="mt-4 max-w-2xl" />}
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Elevation gain per repeat</dt>
          <dd className="font-medium">
            {hill.elevationGainFt !== undefined ? `${hill.elevationGainFt} ft` : NOT_MEASURED}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Repeat distance</dt>
          <dd className="font-medium">
            {hill.repeatDistanceMi !== undefined ? `${hill.repeatDistanceMi} mi` : NOT_MEASURED}
          </dd>
        </div>
      </dl>
      <p className="max-w-xl">{hill.description}</p>
    </div>
  );
}
