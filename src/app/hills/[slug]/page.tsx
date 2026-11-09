import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FindTheMountain } from "@/components/hills/FindTheMountain";
import { HillBreadcrumb, HillHero } from "@/components/hills/HillHero";
import { HillLede } from "@/components/hills/HillIntro";
import { HillRuns } from "@/components/hills/HillRuns";
import { HillAbout, HillRepeats } from "@/components/hills/HillTerrain";
import { MoreHills } from "@/components/hills/MoreHills";
import { getHill, hillsWithPages, otherHills } from "@/lib/hills";
import { withoutHeldRuns } from "@/lib/permit-hold";
import { getRunsAtHill, type RunOccurrence } from "@/lib/runs";

/** Only the listed hills have pages; anything else (incl. the scaffold placeholder) is a 404. */
export const dynamicParams = false;

/** "Run it with us" depends on the runs' upcoming dates, so regenerate hourly (as the homepage). */
export const revalidate = 3600;

export function generateStaticParams() {
  return hillsWithPages().map((hill) => ({ slug: hill.slug }));
}

const pageHill = (slug: string) => {
  const hill = getHill(slug);
  return hill?.page && hill.status !== "placeholder" ? { ...hill, page: hill.page } : undefined;
};

export async function generateMetadata({ params }: PageProps<"/hills/[slug]">): Promise<Metadata> {
  const hill = pageHill((await params).slug);
  if (!hill) return {};
  return {
    title: `${hill.name} | Chicago Mountain Runners`,
    description: hill.page.lede,
    openGraph: { title: hill.name, description: hill.page.lede },
  };
}

/**
 * Hill detail — Figma Hill Details / Desktop 1:6363, Tablet 1:6703, Mobile
 * 1:7032 (IA: "What's this hill like, and when can I run it with CMR?").
 * Header and Footer come from the root layout.
 *
 * One shared structure for every hill: hero, breadcrumb, lede, about + spec
 * rows, repeats, runs here, find it, more hills. Sections vary with what each
 * record holds (mapped route or not; recorded surface; runs or none).
 *
 * Refinement pass (Owner direction, 2026-11-08): the "Elevation gain" numbers
 * strip and the "What goes up." profile section are removed; the breadcrumb
 * moves below the hero; "More hills" becomes the simpler "More hills on
 * repeat." list.
 */
export default async function HillPage({ params }: PageProps<"/hills/[slug]">) {
  const { slug } = await params;
  const hill = pageHill(slug);
  if (!hill) notFound();

  // Permit-pending hold (src/lib/permit-hold.ts): no run reaches the page while official runs are on hold.
  const runs = withoutHeldRuns(getRunsAtHill(hill.slug, new Date())) as RunOccurrence[];
  const more = otherHills(hill.slug);

  return (
    <>
      <HillHero hill={hill} />
      <HillBreadcrumb hill={hill} />
      <HillLede hill={hill} />
      <HillAbout hill={hill} />
      <HillRepeats hill={hill} />
      <HillRuns hill={hill} runs={runs} />
      <FindTheMountain hill={hill} />
      {more.length > 0 && <MoreHills hills={more} />}
    </>
  );
}
