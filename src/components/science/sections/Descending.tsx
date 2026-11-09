import { AscentDescentDiagram } from "@/components/science/diagrams";
import { Cite, Figure, Prose, ScienceSection, SplitRow, Subhead } from "@/components/science/editorial";

/** Descending (black). Figure left, beside the whole section; text right. */
export function Descending() {
  return (
    <ScienceSection id="descending" heading="What Goes Up Must Come Down.">
      <SplitRow
        figureSide="left"
        figure={
          <Figure
            label="Figure 7 · Ascent and descent"
            caption="Schematic, not to scale. It distinguishes the two kinds of work; it does not show their size."
          >
            <AscentDescentDiagram />
          </Figure>
        }
      >
      <Prose>
        <p>
          Every repeat includes a descent, and the descent is not the climb in reverse. Going up, the leg muscles mostly
          shorten while producing force (concentric contractions) to raise the body. Going down, they mostly lengthen while
          producing force (eccentric contractions) to control the drop and absorb energy, with the quadriceps doing much of
          that work <Cite ids={["lu-2025", "bontemps-2020"]} />.
        </p>
        <p>
          Downhill running costs less energy than climbing <Cite ids={["minetti-2002"]} />, but it is mechanically demanding.
          On the steepest downhill grade in one treadmill study, at the fastest speed, the braking part of each footstrike
          more than doubled and the rate of impact loading rose by about half <Cite ids={["vernillo-2020"]} />.
        </p>
      </Prose>


      <Subhead>Soreness and the repeated-bout effect</Subhead>
      <Prose>
        <p>
          Unaccustomed eccentric exercise reliably produces exercise-induced muscle damage: a temporary loss of strength,
          and soreness that usually arrives later rather than during the run. Downhill running produces it so consistently
          that researchers use it as a laboratory model, and the people least accustomed to running downhill generally
          experience the most <Cite ids={["bontemps-2020"]} />.
        </p>
        <p>
          The body adapts. After a first bout of eccentric exercise, a similar bout causes less damage and soreness, a
          protection known as the repeated-bout effect. Its likely mechanisms include changes in the nervous system, in the
          muscle&apos;s mechanical properties, in the connective tissue around muscle fibers, and in biochemical signaling{" "}
          <Cite ids={["hyldahl-2017"]} />.
        </p>
        <p>
          The adaptation is specific. In a 2025 study, 12 untrained adults completed ten downhill treadmill sessions{" "}
          <Cite ids={["bontemps-2025"]} />. Afterward, a standard downhill run caused less quadriceps soreness than it had at
          the start, but the same drop in strength and the same neuromuscular fatigue. Repeated exposure made downhill running
          hurt less. It didn&apos;t make it less fatiguing.
        </p>
      </Prose>

      <Subhead>Why it matters on trails</Subhead>
      <Prose>
        <p>
          Trail and mountain races include long descents, and the muscle damage they cause can reduce performance later in
          the race. Prior exposure to downhill running appears to be the most effective way to prepare for it{" "}
          <Cite ids={["bontemps-2020"]} />. Repeats on a short hill offer that exposure in small, controllable amounts.
        </p>
        <p>
          Small and controllable is the point. Start with a few descents at a relaxed, controlled pace, expect some soreness
          after the first sessions, and add volume gradually. Downhill running is not automatically safe or beneficial in
          larger amounts, and anyone with knee problems or a recent lower-leg injury should be cautious with it.
        </p>
      </Prose>
      </SplitRow>
    </ScienceSection>
  );
}
