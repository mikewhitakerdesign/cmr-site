import { CostChart } from "@/components/science/CostChart";
import { Cite, Figure, Prose, ScienceSection, Subhead } from "@/components/science/editorial";
import { InclineDiagram } from "@/components/science/InclineDiagram";

/** 02 · Physics. Mechanical work against gravity, the metabolic cost of grade, and why short hills work. */
export function Physics() {
  return (
    <ScienceSection id="physics" heading="Gravity Is Doing Its Job.">
      <Prose>
        <p>
          Running on flat ground is mostly a matter of moving forward. Running uphill adds a second job: raising your body
          mass against gravity. That part of the work can be calculated directly. Lifting a mass through a height takes at
          least mass × gravitational acceleration × height in mechanical work.
        </p>
      </Prose>

      <p
        data-slot="equation"
        className="my-10 font-mono text-[28px] leading-9 tracking-[-0.02em] md:my-12 md:text-[36px] md:leading-[44px]"
        aria-label="W equals m times g times h"
      >
        W = m · g · h
      </p>

      <Prose>
        <p>
          Here <i>m</i> is body mass, <i>g</i> is about 9.81 meters per second squared, and <i>h</i> is the height gained.
          For a 70 kg runner climbing 40 feet (about 12.2 meters), that comes to roughly 8.4 kilojoules per climb.
        </p>
        <p>
          That number is a minimum. Muscles convert chemical energy into mechanical work far less than perfectly, and the
          body pays for the whole conversion, so the metabolic cost of the same climb is several times larger.
        </p>
      </Prose>

      <Subhead>Grade, angle and gain are different things</Subhead>
      <Prose>
        <p>
          Grade is rise divided by horizontal distance, written as a percentage. A path that rises 10 feet over 100 feet of
          horizontal distance has a 10 percent grade. The incline angle describes the same slope in degrees: 10 percent is
          about 5.7 degrees. A 100 percent grade is a 45 degree slope, not a vertical wall.
        </p>
        <p>
          Elevation gain is simply how far up you went, however steep the route. Physiological effort is something else
          again. It depends on how fast you climb, how steep the slope is, the surface, your fitness, and how much of the
          climb you run or walk. Two runners can record the same gain and have very different workouts.
        </p>
      </Prose>

      <Figure label="Figure 1 · Incline geometry">
        <InclineDiagram />
      </Figure>

      <Subhead>The cost of going up</Subhead>
      <Prose>
        <p>
          Gravity accounts for only part of what running uphill costs. The legs still support the body, swing forward, and
          absorb and return energy with every step. In a classic treadmill study, Minetti and colleagues measured the
          energy cost of running on slopes from −45 to +45 percent <Cite ids={["minetti-2002"]} />. On the level, running
          cost about 3.4 joules per kilogram of body mass per meter traveled, largely independent of speed. At +45 percent
          it was about 18.9, more than five times as much.
        </p>
        <p>
          Downhill, the cost fell to a minimum of about 1.7 at −20 percent, then rose again on steeper descents. At steep
          uphill gradients the efficiency of running approached that of muscle shortening under load, and at steep downhill
          gradients that of muscle lengthening under load <Cite ids={["minetti-2002"]} />.
        </p>
      </Prose>

      <Figure
        label="Figure 2 · Energy cost of running by gradient"
        caption={
          <>
            The four values reported in the abstract of Minetti et al. (2002), from 10 runners on a treadmill, in joules
            per kilogram of body mass per meter traveled. Points only: the curve between them isn&apos;t drawn because
            these four values don&apos;t define it. <Cite ids={["minetti-2002"]} />
          </>
        }
      >
        <CostChart />
      </Figure>

      <Prose>
        <p>
          More recent reviews confirm the broad pattern and add detail. On a slope, metabolic cost also changes with speed,
          footwear, cadence, foot strike and the runner&apos;s experience on graded terrain <Cite ids={["lu-2025"]} />.
        </p>
      </Prose>

      <Subhead>Why a small hill is enough</Subhead>
      <Prose>
        <p>
          None of this requires a mountain. A hill that rises 40 feet is short, but the work of climbing it is the same
          every time, and repetition turns a short climb into a meaningful total. Twenty-five climbs add up to 1,000 feet
          of gain.
        </p>
        <p>A short hill limits how long each climb lasts. It doesn&apos;t limit how much climbing you can do.</p>
      </Prose>
    </ScienceSection>
  );
}
