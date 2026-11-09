import { JointActionDiagram } from "@/components/science/diagrams";
import { Cite, Figure, Prose, ScienceSection, Subhead } from "@/components/science/editorial";

/** 03 · Physiology. Stride, propulsion, muscle roles, cardiorespiratory demand, activation vs adaptation. */
export function Physiology() {
  return (
    <ScienceSection id="physiology" heading="Your Legs Have Complaints.">
      <Prose>
        <p>
          Uphill running is not flat running tilted a few degrees. The slope changes how the body moves, which muscles do
          the most work, and how hard the heart and lungs work to keep up.
        </p>
      </Prose>

      <Subhead>Shorter steps, more push</Subhead>
      <Prose>
        <p>
          At a given speed on an incline, runners tend to take shorter, quicker steps and spend less time in the air{" "}
          <Cite ids={["lu-2025"]} />. Ground contact changes too. In an instrumented-treadmill study, the propulsive part of
          each footstrike roughly doubled on the steepest uphill grade tested at the fastest speed, while the braking part
          almost disappeared and the rate of impact loading fell <Cite ids={["vernillo-2020"]} />.
        </p>
        <p>More of each step goes into pushing up and forward, and less into absorbing a landing.</p>
      </Prose>

      <Subhead>Who does the work</Subhead>
      <Prose>
        <p>
          The muscles that drive the body forward on the flat drive it upward on a hill, and they work harder doing it.
          Studies of muscle activity during uphill running report greater activity in the main propulsive muscles of the
          leg <Cite ids={["lu-2025"]} />. Other muscles, including those of the trunk, help hold posture as the body leans
          into the slope.
        </p>
      </Prose>

      <Figure
        label="Figure 3 · Joint actions in uphill stance"
        caption="A functional schematic, not an anatomical drawing: limbs and joints, with the main muscle groups named by the action they produce. The trailing leg is shown in gray."
      >
        <JointActionDiagram citeHip={<Cite ids={["khassetarash-2020"]} />} />
      </Figure>

      <Subhead>Heart and lungs</Subhead>
      <Prose>
        <p>
          Because each step on an incline does more work, oxygen demand rises with gradient at a given speed, and heart
          rate, breathing and oxygen uptake rise to meet it <Cite ids={["lu-2025"]} />. A pace that feels easy on the
          lakefront path can feel hard on a modest hill. That&apos;s why uphill intensity is usually judged by effort or heart
          rate rather than pace.
        </p>
      </Prose>

      <Subhead>Activation is not adaptation</Subhead>
      <Prose>
        <p>
          It&apos;s tempting to read &ldquo;more muscle activity&rdquo; as &ldquo;more strength.&rdquo; They are not the same.
          Muscle activation describes what happens during a run. Adaptations develop over weeks of training: changes in
          strength, in how the nervous system coordinates muscles, and in running economy, the oxygen cost of running at a
          given speed. Whether they develop depends on the dose, the runner and what else they are doing.
        </p>
        <p>
          The training studies, covered in the next section, show that the link between uphill running and those
          adaptations is less certain than the activation data suggest <Cite ids={["tham-2026"]} />.
        </p>
      </Prose>
    </ScienceSection>
  );
}
