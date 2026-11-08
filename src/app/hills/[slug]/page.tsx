import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLink } from "@/components/ArrowLink";
import { Container } from "@/components/Container";
import { FindTheMountain } from "@/components/hills/FindTheMountain";
import { HillDirectoryList } from "@/components/hills/HillDirectoryList";
import { HillHero } from "@/components/hills/HillHero";
import { HillLede, HillStats } from "@/components/hills/HillIntro";
import { HillRuns } from "@/components/hills/HillRuns";
import { HillAbout, HillProfileSection, HillRepeats } from "@/components/hills/HillTerrain";
import { SECTION_HEADING, sectionHeading } from "@/components/hills/styles";
import { FLUID_TYPE } from "@/lib/fluid";
import { directoryEntries } from "@/lib/hill-directory";
import { getHill, hillsWithPages, otherHills } from "@/lib/hills";
import { getRunsAtHill } from "@/lib/runs";
import { cn } from "@/lib/utils";

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
    title: `${hill.name} — Chicago Mountain Runners`,
    description: hill.page.lede,
    openGraph: { title: hill.name, description: hill.page.lede },
  };
}

/**
 * Hill detail — Figma Hill Details / Desktop 1:6363, Tablet 1:6703, Mobile
 * 1:7032 (IA: "What's this hill like, and when can I run it with CMR?").
 * Header and Footer come from the root layout.
 *
 * One shared structure for every hill, in the frame's order: hero, lede,
 * numbers, elevation profile, about + spec rows, derived repeats, runs here,
 * find it. Sections vary with what each record holds (photo or drawn hero;
 * measured or illustrative profile; recorded surface or not; runs or none).
 * Added after the frame's last section: "More hills", the way on to the rest
 * of the directory.
 */
export default async function HillPage({ params }: PageProps<"/hills/[slug]">) {
  const { slug } = await params;
  const hill = pageHill(slug);
  if (!hill) notFound();

  const now = new Date();
  const runs = getRunsAtHill(hill.slug, now);
  const others = otherHills(hill.slug).map((h) => h.slug);
  const more = directoryEntries(now).filter((e) => others.includes(e.hill.slug));
  more.sort((a, b) => others.indexOf(a.hill.slug) - others.indexOf(b.hill.slug));

  return (
    <>
      <HillHero hill={hill} />
      <HillLede hill={hill} />
      <HillStats hill={hill} />
      <HillProfileSection hill={hill} />
      <HillAbout hill={hill} />
      <HillRepeats hill={hill} />
      <HillRuns hill={hill} runs={runs} />
      <FindTheMountain hill={hill} />

      {more.length > 0 && (
        <section aria-labelledby="more-heading" className="border-t border-foreground py-24">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4 pb-10">
              <h2 id="more-heading" style={sectionHeading()} className={cn(FLUID_TYPE, SECTION_HEADING)}>
                More hills.
              </h2>
              <ArrowLink href="/hills" className="text-p">
                All hills
              </ArrowLink>
            </div>
            <HillDirectoryList entries={more} headingLevel="h3" />
          </Container>
        </section>
      )}
    </>
  );
}
