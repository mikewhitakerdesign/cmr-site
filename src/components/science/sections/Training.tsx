import { ArrowLink } from "@/components/ArrowLink";
import { Cite, Figure, Instruction, Prose, ScienceSection, SplitAfter, SplitRow, Subhead, TermList } from "@/components/science/editorial";
import { ElevationAccumulator } from "@/components/science/ElevationAccumulator";

/** Training (white). Text left, the accumulator right; the rest of the section continues in the text column. */
export function Training() {
  return (
    <ScienceSection id="training" heading="Small Hill. Real Work.">
      <SplitRow
        figureSide="right"
        figure={
          <Figure
              label="Figure 4 · Elevation accumulator"
              caption={
                <>
                  What this calculates: gain per climb multiplied by completed repeats. What it doesn&apos;t: the descents, how
                  steep or fast each climb was, or how hard it felt. A watch or app may report a different total. The 40-foot
                  default is an illustrative example, not a measurement of any particular hill.{" "}
                  <ArrowLink href="/hills" className="text-foreground">
                    Approximate figures for each hill
                  </ArrowLink>
                </>
              }
            >
              <ElevationAccumulator />
          </Figure>
        }
      >
      <Prose>
        <p>
          A single climb on a short hill may last well under a minute. The training stimulus comes from the whole session:
          how many times you climb, how hard, how long each effort lasts, and how much recovery you take between them.
        </p>
      </Prose>

      <Subhead>Adding it up</Subhead>
      <Prose>
        <p>
          Repetition accumulates two things. One is vertical gain, which is simple arithmetic. The other is time spent
          working against gravity, which matters more for training but is harder to count. The accumulator handles the
          arithmetic.
        </p>
      </Prose>

      <Instruction
        figureSide="right"
        before="Enter the gain of one climb and the number of repeats in the"
        after="to see the total."
      />
      <SplitAfter>

      <Subhead>One hill, different workouts</Subhead>
      <Prose>
        <p>The same hill can serve very different purposes depending on how you run it.</p>
      </Prose>
      <TermList
        className="mt-6"
        items={[
          [
            "Short, hard repeats",
            "Brief efforts near the top of your range, with full recovery between them. The emphasis is on power, uphill mechanics and high-intensity work. Each effort is short, so quality can stay high.",
          ],
          [
            "Sustained climbing",
            "Steady, repeated climbs at an effort you could hold for a long time, with easy descents. The emphasis is aerobic: accumulating time and elevation at a manageable intensity.",
          ],
        ]}
      />
      <Prose className="mt-6">
        <p>
          Between those two sit many variations. Change the effort, the length of each climb, the recovery or the number of
          repeats, and the workout changes with it.
        </p>
      </Prose>

      <Subhead>What the research does and doesn&apos;t show</Subhead>
      <Prose>
        <p>
          Hill repeats are a long-standing part of distance training, and there are good reasons to include them. The
          controlled research, though, is thinner and more mixed than their reputation suggests.
        </p>
        <p>
          In one carefully designed study, 20 well-trained runners completed six weeks of different uphill interval programs{" "}
          <Cite ids={["barnes-2013"]} />. On average their 5 km time-trial performance improved by about 2 percent, with no
          clear best program, and the highest-intensity program produced the largest gain in running economy. Every group
          trained on hills, so the study shows what different hill programs did, not whether hills beat the same effort on
          flat ground.
        </p>
        <p>
          A 2026 systematic review and meta-analysis gathered 13 randomized controlled trials of uphill running in athletes
          and recreationally active adults <Cite ids={["tham-2026"]} />. Individual trials reported improvements in running
          economy, repeated-sprint ability and some aerobic markers. Where the data could be pooled, though, uphill running
          showed no significant effect on knee strength, jumping performance or aerobic capacity compared with other
          training, and the authors rated the certainty of the evidence as low: the trials were few and small, and their
          protocols varied.
        </p>
        <p>
          A fair reading: hill training is a reasonable and specific way to get better at climbing, and it may help other
          qualities. It is not a reliable shortcut to a higher VO₂max, more strength or faster racing. Like most training,
          what it does depends on how it&apos;s done and what it replaces.
        </p>
      </Prose>
      </SplitAfter>
      </SplitRow>
    </ScienceSection>
  );
}
