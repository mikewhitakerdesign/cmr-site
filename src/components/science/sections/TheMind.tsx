import { RepeatWaveform } from "@/components/science/diagrams";
import { Cite, Figure, Prose, ScienceSection, SplitAfter, SplitRow, Subhead } from "@/components/science/editorial";

/** The Mind (white). Text left, the repeat waveform right of the opening; the rest continues in the text column. */
export function TheMind() {
  return (
    <ScienceSection id="the-mind" heading="The Art of Doing It Again.">
      <SplitRow
        figureSide="right"
        figure={
          <Figure
            label="Figure 6 · One hill, again"
            caption="The same climb and descent, repeated. Schematic: it shows the structure of a repeat workout, not measured effort or elevation."
          >
            <RepeatWaveform />
          </Figure>
        }
      >
      <Prose>
        <p>There is something unusual about running up a hill, coming back down, and deciding to do it again.</p>
        <p>The scenery hasn&apos;t changed. The destination hasn&apos;t changed. You&apos;re not getting anywhere particularly interesting.</p>
        <p>
          Yet the repetition gives the workout a structure. One climb. One descent. Another climb. A complicated physical
          effort reduced to a remarkably simple task.
        </p>
      </Prose>


      <Prose>
        <p>
          That simplicity is part of what makes repeats psychologically distinctive. On a long route, attention spreads
          across traffic, turns, scenery and the distance still to go. On a repeat, most of those questions disappear.
          What&apos;s left is the current climb, how it feels, and whether to do another one.
        </p>
        <p>
          Some runners find that narrowing calming. Others find it tedious. Both are reasonable responses to the same hill,
          and neither has been studied much in hill repeats specifically.
        </p>
      </Prose>
      <SplitAfter>

      <Subhead>Exercise and mental well-being</Subhead>
      <Prose>
        <p>
          The broader evidence on exercise and mental health is substantial. A 2023 umbrella review of 97 systematic reviews,
          covering more than 1,000 trials, found that physical activity produced medium-sized reductions in symptoms of
          depression, anxiety and psychological distress across a wide range of adults, although most of the reviews it
          drew on were rated low in quality <Cite ids={["singh-2023"]} />. A 2024 network meta-analysis of randomized trials
          in people with major depression found walking or jogging among the more effective forms of exercise, with larger
          effects at higher prescribed intensity, while rating confidence in the evidence as low{" "}
          <Cite ids={["noetel-2024"]} />. A 2025 umbrella review found small to moderate improvements in general cognition,
          memory and executive function across ages <Cite ids={["singh-2025"]} />.
        </p>
        <p>
          These findings are about exercise in general, mostly structured programs lasting weeks or months. They don&apos;t
          show that hill repeats have special psychological effects, and they don&apos;t show that monotony is therapeutic.
          They support something more modest: regular physical activity, running included, is good for mood and mental
          health for many people. It is not a replacement for professional care when someone needs it.
        </p>
      </Prose>

      <Subhead>Effort, fatigue and the decision to continue</Subhead>
      <Prose>
        <p>
          Each repeat ends with a small decision: go again, or stop. That decision draws on the perception of effort, the
          sense of how hard the work is <Cite ids={["pageaux-2016"]} />, along with fatigue, discomfort, motivation and the
          plan you started with. Repeats make the decision explicit in a way a continuous run doesn&apos;t, which makes them
          useful practice in pacing. If the first three climbs are run too hard, the eighth will make that clear.
        </p>
        <p>
          Distance runners use psychological skills such as self-talk and goal-setting, and mindfulness-based approaches
          have shown some favorable effects on attention, worry and anxiety. A 2026 systematic review found little
          consistent evidence that either reliably improves running performance <Cite ids={["zhai-2026"]} />. They may
          change the experience of a hard effort without changing the result.
        </p>
      </Prose>

      <Subhead>Productive stress, and too much of it</Subhead>
      <Prose>
        <p>
          Training works by imposing stress and then allowing recovery. Short-term fatigue that resolves with rest is a
          normal part of that process. Hard training without enough recovery can instead lead to longer-lasting declines in
          performance, persistent fatigue and mood disturbance, described as non-functional overreaching or, in more
          severe cases, overtraining syndrome <Cite ids={["meeusen-2013"]} />.
        </p>
        <p>
          The ordinary discomfort of hill repeats, such as heavy breathing, burning legs and the wish to stop, is different
          from warning signs. Sharp or localized pain, pain that changes how you run, chest pain, dizziness, unusual
          shortness of breath, or fatigue that lingers for days are reasons to stop and, where appropriate, get checked.
          Pushing through them is not part of the training. The point of a repeat workout is to be able to do another one
          next week.
        </p>
      </Prose>
      </SplitAfter>
      </SplitRow>
    </ScienceSection>
  );
}
