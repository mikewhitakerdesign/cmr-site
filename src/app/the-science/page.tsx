import type { Metadata } from "next";
import { ScienceHero } from "@/components/science/ScienceHero";
import { SectionNav } from "@/components/SectionNav";
import { Breathing } from "@/components/science/sections/Breathing";
import { Descending } from "@/components/science/sections/Descending";
import { Physics } from "@/components/science/sections/Physics";
import { Physiology } from "@/components/science/sections/Physiology";
import { Sources } from "@/components/science/sections/Sources";
import { TheMind } from "@/components/science/sections/TheMind";
import { Training } from "@/components/science/sections/Training";
import { Workouts } from "@/components/science/sections/Workouts";
import { SCIENCE_SECTIONS } from "@/lib/science";

export const metadata: Metadata = {
  title: "The science behind hill repeats | Chicago Mountain Runners",
  description:
    "The science behind hill repeats: the physics, physiology, breathing and psychology of running hills in a very flat city, with sources.",
  alternates: { canonical: "/the-science" },
};

/**
 * /the-science — an editorial resource on running hill repeats (Owner brief,
 * 2026-11-09; .aiom/work/implement-cmr-the-science-page.md).
 *
 * Order is fixed by the brief: hero, Physics, Physiology, Training, Breathing,
 * The Mind, Descending, Workouts, Sources. The page is static (Server
 * Components); client code is limited to the hero's contour field, the
 * shared section bar (SectionNav), the incline slider, the accumulator and the breathing guide.
 *
 * The section bar sits in the same wrapper as the sections, so it is sticky
 * through them and releases before the footer.
 */
export default function SciencePage() {
  return (
    <>
      <ScienceHero />
      <div data-slot="science-body">
        <SectionNav sections={SCIENCE_SECTIONS} label="On this page" slot="science-nav" />
        <Physics />
        <Physiology />
        <Training />
        <Breathing />
        <TheMind />
        <Descending />
        <Workouts />
        <Sources />
      </div>
    </>
  );
}
