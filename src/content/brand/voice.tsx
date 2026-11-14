import type { ReactNode } from "react";
import { HeadlineCheck } from "@/components/brand/demos/HeadlineCheck";
import { Frame, Rule, SpecTable } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_GROW, WEB_ONLY } from "@/components/brand/styles";
import type { BrandChapter } from "@/lib/brand/manual";
import { AVOID_WORDS, MAX_HEADLINE_WORDS } from "@/lib/brand/voice";
import { cn } from "@/lib/utils";

/** Where CMR sits between two poles. `at` is a position from 0 (left) to 100 (right), a judgment and not a measurement. */
function Balance({ left, right, at, children }: { left: string; right: string; at: number; children: ReactNode }) {
  return (
    <div className="border-t border-foreground py-4 [.brand-print_&]:py-3.5">
      <div className="flex items-center gap-4">
        <span className="w-[8.5rem] shrink-0 text-p-sm font-semibold">{left}</span>
        <span aria-hidden className="relative h-px flex-1 bg-foreground/40">
          <span style={{ left: `${at}%` }} className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
        </span>
        <span className="w-[8.5rem] shrink-0 text-right text-p-sm font-semibold">{right}</span>
      </div>
      <p className="mt-2 text-p-sm text-foreground/70">{children}</p>
    </div>
  );
}

function Device({ n, name, example, children }: { n: number; name: string; example: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-x-8 gap-y-2 border-t border-foreground py-4 md:grid-cols-[2rem_minmax(0,5fr)_minmax(0,6fr)] [.brand-print_&]:py-3.5">
      <span className="font-mono text-[13px] leading-7 text-foreground/65">{String(n).padStart(2, "0")}</span>
      <div>
        <p className="text-[20px] leading-6 font-black tracking-[-0.02em]">{name}</p>
        <p className="mt-1 text-p-sm text-foreground/70">{children}</p>
      </div>
      <p className="self-center text-[22px] leading-[27px] font-black tracking-[-0.03em] text-balance [.brand-print_&]:text-[20px] [.brand-print_&]:leading-[25px]">{example}</p>
    </div>
  );
}

/** A proposed line for a context, with the reasoning. */
function Draft({ context, children, why }: { context: string; children: ReactNode; why: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-dashed border-foreground/50 p-4">
      <p className={cn(LABEL, "text-[11px] text-foreground/65")}>{context}</p>
      <p className="mt-2 text-[17px] leading-[23px] font-semibold tracking-[-0.01em] [.brand-print_&]:text-[15.5px] [.brand-print_&]:leading-[21px]">{children}</p>
      <p className="mt-2 text-[13px] leading-[18px] text-foreground/65 [.brand-print_&]:mt-1.5 [.brand-print_&]:text-[12.5px] [.brand-print_&]:leading-[17px]">{why}</p>
    </div>
  );
}

export const voice: BrandChapter = {
  slug: "voice",
  number: "07",
  title: "Voice.",
  name: "Voice",
  summary: "Deadpan, specific and kind. CMR says absurd things in a perfectly level tone, gets its facts right, and never makes anyone feel slow.",
  plates: [
    {
      id: "character",
      title: "Deadpan, specific, kind.",
      nav: "Character",
      lede: "The voice is a knowledgeable friend who finds the whole enterprise slightly ridiculous and does it anyway. It states the facts, lets one dry remark through, and moves on without waiting for the laugh.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <Frame ground="black" className="flex min-h-[320px] flex-col justify-between p-8 lg:col-span-5 [.brand-print_&]:min-h-0">
            <p className={cn(LABEL, "text-foreground/70")}>From the Warren Hill page</p>
            <p className="text-[clamp(26px,3.2vw,40px)] leading-[1.08] font-black tracking-[-0.03em] text-balance">
              Warren Park covers roughly 89 acres and has a nine-hole golf course and an ice rink. The hill is proving less cooperative.
            </p>
            <p className="text-p-sm text-foreground/75">Two facts and one understatement. That is the whole method.</p>
          </Frame>
          <div className="lg:col-span-7">
            <Balance left="Humor" right="Seriousness" at={42}>
              Funny about the premise, serious about everything a runner relies on: times, places, safety, sources.
            </Balance>
            <Balance left="Community" right="Individual" at={50}>
              “We” for the club, “you” for the runner. Your pace, your count, our hill.
            </Balance>
            <Balance left="Technical" right="Accessible" at={62}>
              Knows the physiology, explains it in plain words, and never uses a term to show off.
            </Balance>
            <Balance left="Chicago" right="Mountains" at={30}>
              The places are Chicago. The mountains are a way of talking about them.
            </Balance>
            <Balance left="Confident" right="Inclusive" at={58}>
              Sure of itself, never at anyone&apos;s expense. The joke is always on the hill or on us.
            </Balance>
            <Balance left="Brief" right="In depth" at={28}>
              Short by default. The Science is the one place that earns length, and it earns it with citations.
            </Balance>
          </div>
        </div>
      ),
    },
    {
      id: "devices",
      title: "Five devices.",
      nav: "Devices",
      lede: "Almost every line that sounds like CMR is using one of these. One per line is usually plenty; two in the same sentence starts to sound like trying.",
      render: () => (
        <div className={PRINT_GROW}>
          <Device
            n={1}
            name="The strike-through."
            example={
              <>
                Chicago <s>Hills</s> Mountains
              </>
            }
          >
            A visible second thought. The struck word stays readable, and stays in the text for screen readers. Sparingly: it stops being funny when it is everywhere.
          </Device>
          <Device n={2} name="The understatement." example="It isn't tall, but it isn't nothing either.">
            Describe something modest with total composure. Never add “lol,” an emoji or an exclamation mark to help it along.
          </Device>
          <Device n={3} name="The full stop." example="Bad weather. Good hills.">
            Headlines are flat statements that end. Two short sentences beat one clever one.
          </Device>
          <Device n={4} name="The list of three." example="No membership fee. No pace requirement. No complicated initiation ritual.">
            Two straight items, then one that tilts. The third is where the voice lives.
          </Device>
          <Device n={5} name="The honest ≈." example="Summit ≈ 620 ft">
            Approximate numbers say so. Precision the data cannot support is a kind of lying, and the brand does not do it even for effect.
          </Device>
        </div>
      ),
    },
    {
      id: "words",
      title: "Words we use.",
      nav: "Vocabulary",
      lede: "A small vocabulary, used consistently. It is how the site already writes.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-7">
            <SpecTable
              caption="Preferred CMR vocabulary"
              head={["Word", "Use it for", "On the site"]}
              rows={[
                ["Club", "Everyday reference to CMR.", "“Join the club.” “2026 club totals.”"],
                ["Running community", "Describing what CMR is.", "“…is a running community for finding elevation…”"],
                ["Group runs", "The organized activity.", "“Join the club to join the weekly group runs.”"],
                ["Hill / mountain / mtn", "The same thing. Pick whichever is funnier or shorter.", "“Every mountain range needs a backstory.” “MAKE YOUR OWN MTNS”"],
                ["Repeats", "The workout. Rather than “reps” or “intervals.”", "“Hills on repeat.” “At this point, locating it may count as the first repeat.”"],
                ["Elevation, vertical, climb", "What is being collected.", "“Vertical climbed.” “Lots of elevation.”"],
                ["Show up", "The only ask.", "“Just show up.” “Show up, run the hill, repeat.”"],
              ]}
            />
          </div>
          <div className="flex flex-col lg:col-span-5">
            <h3 className={cn(LABEL, "mb-3 text-foreground/65")}>Not in the vocabulary</h3>
            <ul className="flex flex-wrap gap-2">
              {AVOID_WORDS.map((w) => (
                <li key={w} className="rounded-md border border-foreground/40 px-2.5 py-1 font-mono text-[13px] leading-5 line-through">
                  {w}
                </li>
              ))}
            </ul>
            <div className={cn("grid gap-6", PRINT_BOTTOM)}>
              <Rule title="No stock motivation.">No tough talk and no battle language. If a line would fit on any gym wall, it is not CMR.</Rule>
              <Rule title="No ranking of runners.">No “elite,” “real runners,” “serious athletes,” or anything that implies a pace matters. It does not.</Rule>
              <Rule title="No inflated claims.">No “Chicago&apos;s premier,” no member counts we cannot show, no “official” anything without the permit to match.</Rule>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "mechanics",
      title: "Mechanics.",
      nav: "Mechanics",
      lede: "The small habits that make copy look edited. Each is taken from how the site already writes.",
      render: () => (
        <>
          <SpecTable
            caption="Capitalization, punctuation and formatting conventions"
            head={["Thing", "Convention", "Example"]}
            rows={[
              ["Headlines", "Sentence case, with a period. A question mark when it is a question.", "“New here? Good.”"],
              ["Statements", "All caps, rarely: a few short statements, and hill names in their heroes.", "“JUST SHOW UP.”"],
              ["Expressions as names", "Title Case when used as a label or in a sentence. No ™.", "Hills on Repeat"],
              ["The name", "In full first, then CMR. The ™ appears in the artwork and the homepage statement only.", "Chicago Mountain Runners"],
              ["Exclamation marks", "Rare. The whole site has two: a thank-you, and the moon.", "“We're going to the moon!”"],
              ["Numbers", "Numerals for measurements; “≈” when approximate; “K” for thousands in totals.", "≈ 620 ft · 132K ft"],
              ["Distance", "Feet and miles. Leading zero dropped, the way runners say it.", ".2 miles"],
              ["Time", "Twelve-hour, AM/PM in caps. Day as three capitals, in mono, with a middle dot.", "WED · 5:30 AM"],
              ["Places", "Park, then neighborhood, joined by a middle dot.", "Montrose Beach · Uptown"],
              ["Oxford comma", "Not used in lists of three.", "“…running it repeatedly and occasionally…”"],
            ]}
          />
          <div className={cn("mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="Contractions, yes.">“Isn&apos;t,” “we&apos;re,” “you&apos;re.” The voice talks; it does not issue statements.</Rule>
            <Rule title="First person plural.">“We” is the club. The founder&apos;s letter is the only place for “I.”</Rule>
            <Rule title="Links say where they go.">“Explore all hills,” “Read the Participation Guidelines.” Never “click here” or “learn more.”</Rule>
          </div>
        </>
      ),
    },
    {
      id: "live",
      title: "As written.",
      nav: "Real examples",
      lede: "The voice, in place. Every line here is on the live site today, quoted exactly.",
      render: () => (
        <SpecTable
          caption="Examples of CMR copy on the live site, by context"
          head={["Context", "The line", "What it is doing"]}
          rows={[
            ["Homepage hero", "MAKE YOUR OWN MTNS", "The premise, as an instruction."],
            ["Brand statement", <>Chicago Mountain Runners is a running community for finding elevation, running it repeatedly and occasionally questioning our <s>sanity</s> decisions.</>, "Descriptor, list of three, strike-through."],
            ["About headline", "A running group hunting elevation where there shouldn’t be any.", "Says what it is, admits the problem."],
            ["Hill description", "A former Evanston landfill, closed in 1965 and promoted to mountain. Garbage, it turns out, stacks well.", "Sourced fact, then the dry line."],
            ["Missing data", "A park hill in West Ridge that our elevation data hasn't found yet. The sledders seem confident it exists.", "Turns a gap into honesty and a joke at once."],
            ["Weather", "Rain, wind, snow, cold, heat. We're not particularly picky.", "Sets the expectation without bravado."],
            ["First-timers", "Climb at a pace that works for you. Nobody is keeping score.", "Removes the fear before it is voiced."],
            ["Join confirmation", "In the meantime, there's a hill with your name on it.", "Warm, and still about the hills."],
            ["FAQ", "You decide how many repeats to run, how long to stay, and when you're finished. The hill isn't going anywhere.", "A real answer first. The joke is the last sentence."],
            ["On hold", "Hills on pause.", "Plain news, in the house style."],
            ["Tooltip", "No fees. No commitments. Lots of elevation.", "The promise, in nine words."],
          ]}
        />
      ),
    },
    {
      id: "drafts",
      title: "More examples.",
      nav: "More examples",
      lede: "The method, applied to situations the site has not had to write for yet. Use them as patterns, not as copy: none describes an event that has happened.",
      render: () => (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Draft context="Run announcement" why="Day, time, place, then one line of voice. Facts first, always.">
              Saturday, 7:00 AM, Cricket Hill. It will still be 30 feet tall.
            </Draft>
            <Draft context="Weather: going ahead" why="Echoes “Bad weather. Good hills.” without repeating it.">
              It&apos;s 19 degrees. The hill doesn&apos;t know that.
            </Draft>
            <Draft context="Weather: cancelled" why="No joke in the first sentence. Safety news is delivered straight.">
              Tonight&apos;s run is cancelled for lightning. The hill will keep.
            </Draft>
            <Draft context="Joining" why="The existing promise, extended by one honest clause.">
              No fees. No commitments. You do have to climb the hill yourself.
            </Draft>
            <Draft context="Apparel slogan" why="An existing expression, set as it is on the site. Nothing new invented.">
              Hills on repeat.
            </Draft>
            <Draft context="Apparel slogan" why="The existing closing statement. Works alone, without the name.">
              Flat is a state of mind.
            </Draft>
            <Draft context="Event" why="States the format plainly; the understatement carries it.">
              One hill. Six hours. Bring snacks.
            </Draft>
            <Draft context="Science editorial" why="A claim the article can then source, phrased as the reader would ask it.">
              Why does a 30-foot hill hurt this much?
            </Draft>
            <Draft context="Social caption" why="Names the place and the count. No hashtags doing the talking.">
              Horner Hill, 22 repeats, one confused dog walker.
            </Draft>
            <Draft context="Member welcome" why="Echoes the Join page’s “officially unofficial.”">
              You&apos;re in. There was no vetting process.
            </Draft>
            <Draft context="Safety" why="No humor at all. This register is on the next page.">
              Lightning within ten miles cancels the run. Check the calendar before you leave.
            </Draft>
            <Draft context="Participation" why="Plain, complete, and kind. The voice here is clarity.">
              Run at your own pace, stop when you need to, and tell an organizer if you head out early.
            </Draft>
          </div>
          <div className={cn("mt-10 border-t border-foreground pt-8", WEB_ONLY)}>
            <h3 className="text-[20px] leading-6 font-black tracking-[-0.02em]">Check a headline.</h3>
            <p className="mt-2 mb-6 max-w-[60ch] text-p-sm text-foreground/70">
              Five checks drawn from the rules in this chapter: {MAX_HEADLINE_WORDS} words or fewer, sentence case, a full stop, no exclamation mark, no stock motivation.
            </p>
            <HeadlineCheck />
          </div>
          <p className={cn("mt-8 max-w-[80ch] text-p-sm text-foreground/70", PRINT_BOTTOM)}>
            Days, times, temperatures, repeat counts and the lightning distance above are for illustration. Real messages use the real schedule and the club&apos;s actual weather policy.
          </p>
        </>
      ),
    },
    {
      id: "serious",
      title: "Where the jokes stop.",
      nav: "Serious register",
      lede: "When the subject is someone's safety, money, data or legal position, the voice drops the wit and keeps everything else: short sentences, plain words, no hedging. The FAQ already shows how.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-7">
            <SpecTable
              caption="Serious-register examples from the CMR FAQ and site"
              head={["Subject", "As written on the site"]}
              rows={[
                ["Injury", "“Stop exercising and seek appropriate assistance. Tell someone nearby or the organizer when possible. For a serious or potentially life-threatening emergency, call 911.”"],
                ["Dangerous weather", "“Lightning, thunderstorms, tornado warnings, and other dangerous conditions are a different story. Stay safe and stay home.”"],
                ["Responsibility", "“You're responsible for assessing your fitness, conditions, and readiness, choosing an appropriate effort, and exercising reasonable care for yourself and others.”"],
                ["Age", "“You must be at least 18 to join CMR or participate in an organized club run.”"],
                ["Conduct", "“Unsafe, threatening, harassing, or discriminatory conduct isn't welcome.”"],
                ["Risk notice", "“Running carries inherent physical risk. Participate within your own limits and consult a physician before beginning any new training. Not medical advice.”"],
              ]}
            />
          </div>
          <div className="flex flex-col lg:col-span-5">
            <div className="grid gap-6">
              <Rule title="No jokes about harm.">Nothing playful in or beside safety instructions, medical language, the waiver, the privacy policy or the terms.</Rule>
              <Rule title="No expressions near them either.">“Get High in the City” and strike-throughs stay away from legal, safety and park-facing text.</Rule>
              <Rule title="Say exactly what is true.">“May,” “when possible,” and “we&apos;ll try” are honest, not weak. Do not promise supervision, cancellations or outcomes the club cannot guarantee.</Rule>
              <Rule title="The Science stays sourced.">Exercise claims carry a citation. It informs; it never prescribes. “Not medical advice” means it.</Rule>
            </div>
            <div className={cn("rounded-lg bg-muted p-5", PRINT_BOTTOM, "[.brand-print_&]:mt-auto")}>
              <p className="text-p-sm text-foreground/80">Legal documents are the Owner&apos;s, not the brand&apos;s. This manual describes their tone and changes none of their wording.</p>
            </div>
          </div>
        </div>
      ),
    },
  ],
};
