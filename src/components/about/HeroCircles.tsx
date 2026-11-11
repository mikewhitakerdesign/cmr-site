import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

/**
 * The four About-hero circles: equal diameters, the homepage club-totals
 * tie-dye fills (`@/lib/tints` + `cmr-tie-dye`, one tint each), no shadow.
 *
 * Layout is CSS grid. From `lg` the four sit in one evenly spaced row; below
 * it they form a 2 × 2 grid. Each circle fills its grid cell (the track is
 * capped at the diameter), so a percentage margin equals the diameter: the
 * circles in the last row take `-mb-[25%]`, which pulls the section boundary up
 * so they overlap the black founder section by 25% of their diameter. In
 * the 2 × 2 grid only the bottom two do.
 *
 * Motion is decorative and governed by the site's one motion preference
 * (`html[data-motion]`, src/lib/motion.ts: system reduced motion and the
 * footer's Pause motion): the same slow, tiny float on every circle at once
 * (CSS transform, `.about-float` in cmr.css), so the row stays aligned.
 */
export function HeroCircles({ circles }: { circles: string[] }) {
  return (
    <ul
      className={cn(
        "relative z-10 mt-12 grid grid-cols-[repeat(2,minmax(0,200px))] gap-x-6 gap-y-6 md:mt-14 md:grid-cols-[repeat(2,minmax(0,240px))] md:gap-x-8",
        "lg:mt-16 lg:grid-cols-[repeat(4,minmax(0,280px))] lg:justify-between lg:gap-x-8",
      )}
    >
      {circles.map((text, i) => (
        <li key={text} style={tintVars(i)} className={cn(i >= 2 ? "-mb-[25%]" : "lg:-mb-[25%]")}>
          <div
            className={cn(
              "about-float relative isolate flex aspect-square w-full items-center justify-center overflow-hidden rounded-full px-[12%] text-center",
              "text-[14px] leading-[1.15] font-extrabold text-balance md:text-[20px] lg:text-[17px] xl:text-[22px]",
            )}
          >
            <span aria-hidden className="cmr-tie-dye absolute -z-10" />
            {text}
          </div>
        </li>
      ))}
    </ul>
  );
}
