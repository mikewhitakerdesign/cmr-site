import { BreathingPacer } from "@/components/science/BreathingPacer";
import { Cite, Figure, Instruction, Prose, ScienceSection, SplitAfter, SplitRow, Subhead, TermList } from "@/components/science/editorial";

/**
 * The Owner-approved opening of the Breathing section. Preserve exactly: no
 * additions, no rewrites, and the earlier final sentence stays removed.
 * tests/lib/science.test.tsx compares the rendered text to this.
 */
export const BREATHING_OPENING = [
  "You've been breathing your entire life. Congratulations. You're probably pretty good at it.",
  "But there's a difference between breathing automatically and breathing intentionally.",
  "Whether you're climbing a mountain at altitude, grinding through your twentieth hill repeat, or trying to convince yourself that another five miles sounds reasonable, the way you breathe can influence how you experience physical effort and stress.",
  "The interesting part is that breathing is both automatic and something you can consciously control. That gives us a direct way to influence certain physiological and psychological responses.",
] as const;

/**
 * Breathing (black). Figure left, text right: the breathing guide follows the
 * opening, the mechanics and controlled breathing (where its instruction is)
 * on phones, and stays in view beside the whole section from 1280px.
 */
export function Breathing() {
  return (
    <ScienceSection id="breathing" heading="Breathing. It's Kind of Important.">
      <SplitRow
        figureSide="left"
        figure={
          <Figure label="Figure 5 · Breathing patterns">
            <BreathingPacer />
          </Figure>
        }
      >
      <Prose>
        <div data-slot="breathing-opening" className="flex flex-col gap-5">
          {BREATHING_OPENING.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Prose>

      <Subhead id="breathing-mechanics">The mechanics of breathing</Subhead>
      <Prose>
        <p>
          At rest, breathing is mostly the diaphragm&apos;s job. The dome-shaped muscle beneath the lungs contracts and
          flattens, the chest expands, and air flows in. Breathing out at rest is largely passive: the lungs and chest wall
          spring back.
        </p>
        <p>
          Exercise changes the arrangement. Working muscles use more oxygen and produce more carbon dioxide, and ventilation,
          the volume of air moved each minute, rises to match. Breaths get deeper and faster. Muscles between the ribs and in
          the neck help lift the ribcage, and the abdominal muscles start pushing air out instead of waiting for the lungs
          to recoil <Cite ids={["sheel-2012"]} />.
        </p>
        <p>
          In healthy people exercising near sea level, that system is precisely regulated to keep oxygen and carbon dioxide
          in the blood close to their usual levels <Cite ids={["sheel-2012"]} />. What changes most noticeably is how it
          feels. Faster, harder breathing is a large part of what makes hard running feel hard.
        </p>
      </Prose>

      <Subhead id="breathing-controlled">Controlled breathing and mindfulness</Subhead>
      <Prose>
        <p>
          Several techniques put that conscious control to use, each in a different way:
        </p>
      </Prose>
      <TermList
        className="mt-6"
        items={[
          ["Box breathing", "Equal counts for the inhale, a hold, the exhale and another hold, such as four seconds each."],
          [
            "Slow-paced breathing",
            <>
              Deliberately slowing the breath, often to around six breaths a minute, close to a natural rhythm of the
              cardiovascular system <Cite ids={["shao-2024"]} />.
            </>,
          ],
          ["Extended exhalation", "Making the exhale longer than the inhale. Cyclic sighing, which emphasizes long exhalations, is one version."],
        ]}
      />
      <Prose className="mt-8">
        <p>
          The short-term evidence for slow breathing is fairly consistent. A systematic review of slow breathing techniques
          (fewer than 10 breaths a minute) in healthy people linked them with higher heart rate variability and with greater
          relaxation and comfort and less anxiety and arousal <Cite ids={["zaccaro-2018"]} />. A 2024 meta-analysis of 31
          studies found reliable short-term effects on cardiovascular measures, including lower systolic blood pressure and
          higher heart rate variability, and a modest, statistically marginal reduction in negative emotion, particularly
          perceived stress <Cite ids={["shao-2024"]} />. Long-term effects are not yet established.
        </p>
        <p>
          Individual techniques have less evidence behind them than the category does. In one remote randomized study,
          participants practiced one of three breathing exercises, or mindfulness meditation, for five minutes a day for a
          month <Cite ids={["balban-2023"]} />. The breathing exercises improved mood more than meditation did, and the
          clearest results came from exhale-focused cyclic sighing, which also lowered respiratory rate more. Box breathing
          was one of the three exercises, not the standout.
        </p>
        <p>
          Mindfulness research overlaps with breathing research, because many mindfulness practices use the breath as an
          anchor for attention. That makes it hard to say whether an effect comes from the breathing pattern, from where
          attention goes, or from stopping for five minutes to do something calm. It&apos;s reasonable to treat controlled
          breathing as a tool for settling attention and arousal. It isn&apos;t reasonable to treat any particular count as
          a treatment.
        </p>
      </Prose>

      <Instruction
        figureSide="left"
        before="Choose a pattern and press Start in the"
        after="to follow it at your own pace. Pause or reset at any time."
      />
      <SplitAfter>

      <Subhead id="breathing-altitude">Pressure breathing at altitude</Subhead>
      <Prose>
        <p>
          Air at altitude contains the same 21 percent oxygen as air at sea level, but the air pressure is lower, so each
          breath delivers oxygen at a lower partial pressure. In one study at 3,450 meters, the inspired oxygen pressure was
          about 91 mmHg <Cite ids={["rupp-2019"]} />, compared with roughly 150 mmHg at sea level. Less pressure moving
          oxygen into the blood means lower blood oxygen saturation.
        </p>
        <p>
          The body responds by breathing more, and over days to weeks it acclimatizes. Gradual ascent, which gives
          acclimatization time to work, remains the foundation of preventing altitude illness <Cite ids={["luks-2024"]} />.
        </p>
        <p>
          Pressure breathing is a technique taught by mountain guides. It replaces a passive exhale with a deliberate,
          forceful one, often through pursed lips, followed by a full breath in. Guides teach it as a way to keep breathing
          deep and rhythmic through hard steps at altitude.
        </p>
        <p>
          The closest research involves devices rather than technique. In positive expiratory pressure (PEP) studies,
          people breathe out through a mask against a set resistance. In a study comparing simulated and real moderate
          altitude, 10 cmH₂O of PEP raised blood oxygen saturation by about four percentage points in both{" "}
          <Cite ids={["rupp-2019"]} />. In trekkers
          at 5,085 meters, the same pressure raised saturation by about nine percentage points and eased symptoms of acute
          mountain sickness during the session, though it also reduced cardiac output and blood flow velocity to the brain{" "}
          <Cite ids={["rupp-2021"]} />.
        </p>
        <p>
          Those results are interesting, and they are not the same thing as a climber&apos;s forceful exhale. A mask with a
          calibrated valve applies a known, steady pressure; a pursed-lip exhale on a glacier does not, and we found no
          controlled studies of the guide-taught technique itself. The effects measured were short-term changes while
          breathing that way, not lasting changes in lung capacity, and they are no substitute for acclimatization.
        </p>
        <p data-slot="founder-note" className="border-l-2 border-foreground pl-5 text-foreground">
          CMR&apos;s founder learned pressure breathing from RMI guides during a two-week skills seminar on Mount Rainier
          that ended with a summit by the Disappointment Cleaver route. He later carried a version of it into ultramarathons:
          sometimes in the first miles, as a way to settle in and focus, and more often late in a race, when fatigue made
          deliberate attention more useful. That is one runner&apos;s experience. It says something about focus and routine,
          and nothing about oxygenation or performance.
        </p>
      </Prose>

      <Subhead id="breathing-running">Breathing during endurance running</Subhead>
      <Prose>
        <p>
          Most runners don&apos;t think about breathing until a run gets hard. As intensity rises, breathing gets faster and
          deeper <Cite ids={["sheel-2012"]} />, and paying attention to it can be useful in practical ways. It&apos;s a quick
          read on effort: breathing that has turned ragged by the third climb says something about pacing. A deliberate
          pattern, such as a longer exhale on the way down, also gives attention somewhere to settle during long or
          repetitive efforts.
        </p>
        <p>
          The evidence for performance effects is limited. A 2026 systematic review of psychological skills training and
          mindfulness in distance runners found favorable signals for some psychological outcomes, including attentional
          refocusing, worry and cognitive anxiety, but sparse and inconsistent evidence for changes in race or time-trial
          performance <Cite ids={["zhai-2026"]} />. Perception of effort, the sense of how hard you are working, is studied as
          its own thing, separate from breathlessness or discomfort <Cite ids={["pageaux-2016"]} />. Attention to breathing
          may change how hard a run feels. Whether it changes how fast you can run is a separate and mostly unanswered
          question.
        </p>
        <p>
          Reasonable, then: breathing as a pacing check and a focus tool. Not established: breathing techniques as a way to
          raise oxygen delivery or race faster. And if a breathing pattern is fighting the effort you are running, let the
          pattern go and breathe to match the work.
        </p>
      </Prose>
      </SplitAfter>
      </SplitRow>
    </ScienceSection>
  );
}
