import type { ReactNode } from "react";
import { ArrowLink } from "@/components/ArrowLink";
import { WorkoutIcon } from "@/components/science/diagrams";
import { Cite, Prose, ScienceSection } from "@/components/science/editorial";
import { cn } from "@/lib/utils";

type Workout = {
  kind: "short-steep" | "long-slow" | "up-down";
  name: string;
  purpose: string;
  rows: [string, ReactNode][];
};

/**
 * Conservative starting points, not prescriptions. The research protocols cited
 * used trained athletes and higher volumes, so the examples start below them.
 * No hill-specific distances or elevations: CMR hasn't verified any.
 */
const WORKOUTS: Workout[] = [
  {
    kind: "short-steep",
    name: "Short & Steep",
    purpose: "Strong uphill mechanics and high-intensity effort, in a small dose.",
    rows: [
      ["Stimulus", "Brief, hard efforts that work the propulsive muscles strongly, with full recovery so each one stays sharp."],
      ["Suited to", "Runners who already run comfortably several times a week and are free of injury."],
      [
        "Example",
        <>
          After 15 to 20 minutes of easy running, 6 to 8 climbs of 20 to 30 seconds at a hard but controlled effort. Walk or
          jog back down and let your breathing settle before the next one. Research protocols commonly used 10 to 14
          thirty-second efforts on about a 10 percent grade, in athletes and active adults <Cite ids={["tham-2026"]} />; this starts lower.
        </>,
      ],
      ["Recovery", "Treat it as a hard day. Run easy, or rest, the day after."],
    ],
  },
  {
    kind: "long-slow",
    name: "Long & Slow",
    purpose: "Sustained climbing and pacing on a grade, at an aerobic effort.",
    rows: [
      ["Stimulus", "Continuous, moderate work that accumulates time climbing and total elevation without high intensity."],
      ["Suited to", "Runners who can comfortably run about 45 minutes on the flat. Effort, not pace, sets the speed."],
      [
        "Example",
        "30 to 45 minutes of continuous repeats at an effort where you could still speak in full sentences, jogging down easy. The accumulator above will total the gain.",
      ],
      ["Recovery", "Similar to a moderate long run. Ease off if your legs are still sore from earlier descents."],
    ],
  },
  {
    kind: "up-down",
    name: "Up & Down",
    purpose: "Conditioning for descents, terrain awareness, and gradual progression.",
    rows: [
      ["Stimulus", "Controlled descents that load the quadriceps eccentrically, in amounts small enough to adapt to."],
      ["Suited to", "Runners with some hill experience and no current knee or lower-leg injury. Most relevant before a trail or mountain race."],
      [
        "Example",
        "4 to 6 repeats where the climb is easy and the descent is the focus: relaxed, short, quick steps, controlled speed, eyes ahead. Over several weeks, add a couple of repeats at a time.",
      ],
      [
        "Recovery",
        <>
          Expect soreness after the first sessions, often worst a day or two later. Let it fade before the next downhill-focused
          session <Cite ids={["bontemps-2020"]} />.
        </>,
      ],
    ],
  },
];

/** 08 · Workouts. Three understated approaches, typographic, not promotional cards. */
export function Workouts() {
  return (
    <ScienceSection id="workouts" heading="Put the Science to Work.">
      <Prose>
        <p>
          Three ways to use a short hill. Each is a starting point, not a prescription: adjust it to your experience, your
          hill and how you feel on the day, and build up gradually. If you&apos;re new to running or coming back from an
          injury, build a base on the flat first.
        </p>
      </Prose>

      <ol className="mt-12 grid border-t border-foreground lg:grid-cols-3 md:mt-16">
        {WORKOUTS.map((w, i) => (
          <li
            key={w.kind}
            data-slot="workout"
            className={cn(
              "flex flex-col border-b border-foreground/15 py-10 lg:border-b-0 lg:py-12",
              i > 0 && "lg:border-l lg:border-foreground/15 lg:pl-10",
              i < WORKOUTS.length - 1 && "lg:pr-10",
            )}
          >
            <div className="flex items-center justify-between gap-6">
              <span className="font-mono text-[14px] leading-5 tracking-[0.1em] text-foreground/65" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <WorkoutIcon kind={w.kind} />
            </div>
            <h3 className="mt-6 text-[30px] leading-[34px] font-black tracking-[-0.03em] uppercase md:text-[34px] md:leading-[38px]">
              <span className="sr-only">{i + 1}. </span>
              {w.name}
            </h3>
            <p className="mt-3 max-w-[40ch] text-[18px] leading-[28px] text-foreground/85">{w.purpose}</p>
            <dl className="mt-6 flex flex-col gap-5">
              {w.rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[12px] leading-5 tracking-[0.1em] text-foreground/65 uppercase">{k}</dt>
                  <dd className="mt-1 text-[16px] leading-[25px] text-foreground/85">{v}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-col gap-3 md:mt-14">
        <p className="max-w-[680px] text-[18px] leading-[30px] text-foreground/85">
          Any of these works on a short hill. Chicago has a few.
        </p>
        <ArrowLink href="/hills" className="self-start text-[18px] leading-7">
          Explore the hills
        </ArrowLink>
      </div>
    </ScienceSection>
  );
}
