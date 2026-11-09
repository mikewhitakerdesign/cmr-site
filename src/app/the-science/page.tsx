import type { Metadata } from "next";
import { ScienceHero } from "@/components/science/ScienceHero";
import { ScienceNav } from "@/components/science/ScienceNav";
import { Breathing } from "@/components/science/sections/Breathing";
import { Descending } from "@/components/science/sections/Descending";
import { Physics } from "@/components/science/sections/Physics";
import { Physiology } from "@/components/science/sections/Physiology";
import { Sources } from "@/components/science/sections/Sources";
import { TheMind } from "@/components/science/sections/TheMind";
import { Training } from "@/components/science/sections/Training";
import { Workouts } from "@/components/science/sections/Workouts";

export const metadata: Metadata = {
  title: "The Science | Chicago Mountain Runners",
  description:
    "The science of going nowhere: the physics, physiology, breathing and psychology of running hill repeats in a flat city, with sources.",
};

/**
 * /the-science — an editorial resource on running hill repeats (Owner brief,
 * 2026-11-09; .aiom/work/implement-cmr-the-science-page.md).
 *
 * Order is fixed by the brief: hero, Physics, Physiology, Training, Breathing,
 * The Mind, Descending, Workouts, Sources. The page is static (Server
 * Components); client code is limited to the hero's terrain canvas, the
 * section bar, the incline slider, the accumulator and the breathing guide.
 *
 * The section bar sits in the same wrapper as the sections, so it is sticky
 * through them and releases before the footer.
 */
export default function SciencePage() {
  return (
    <>
      <ScienceHero />
      <div data-slot="science-body">
        <ScienceNav />
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
