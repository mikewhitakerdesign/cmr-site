import type { CSSProperties, ReactNode } from "react";
import { BrandBadge } from "@/components/brand/BrandBadge";
import { Frame, Pending, Rule, Source, SpecTable, StatusTag } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_GROW } from "@/components/brand/styles";
import { TopoPattern } from "@/components/home/TopoPattern";
import type { BrandChapter, Status } from "@/lib/brand/manual";
import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

/** Two words CMR holds at once, and how. */
function Tension({ a, b, children }: { a: string; b: string; children: ReactNode }) {
  return (
    <div className="border-t border-foreground py-4 [.brand-print_&]:py-3">
      <p className="flex items-baseline gap-3 text-[24px] leading-7 font-black tracking-[-0.03em]">
        <span>{a}</span>
        <span aria-hidden className="h-px flex-1 self-center bg-foreground/40" />
        <span className="sr-only">and</span>
        <span>{b}</span>
      </p>
      <p className="mt-2 text-p-sm text-foreground/70">{children}</p>
    </div>
  );
}

/** A statement with its evidence level. */
function Statement({ label, status, children, note }: { label: string; status: Status; children: ReactNode; note: string }) {
  return (
    <div className="grid gap-x-8 gap-y-2 border-t border-foreground py-5 md:grid-cols-[9rem_1fr] [.brand-print_&]:py-4">
      <div>
        <p className={cn(LABEL, "text-foreground/65")}>{label}</p>
        <StatusTag status={status} className="mt-2" />
      </div>
      <div>
        <p className="text-[22px] leading-[28px] font-black tracking-[-0.02em] text-balance [.brand-print_&]:text-[20px] [.brand-print_&]:leading-[25px]">{children}</p>
        <p className="mt-1.5 text-[13px] leading-[19px] text-foreground/65">{note}</p>
      </div>
    </div>
  );
}

function AudienceCircle({ i, title, children }: { i: number; title: string; children: ReactNode }) {
  return (
    <li>
      <div style={tintVars(i) as CSSProperties} className="relative isolate mx-auto flex aspect-square w-full max-w-[250px] items-center justify-center overflow-hidden rounded-full px-[13%] text-center [.brand-print_&]:max-w-[230px]">
        <span aria-hidden className="cmr-tie-dye absolute -z-10" />
        <span className="text-[19px] leading-[1.15] font-extrabold text-balance">{title}</span>
      </div>
      <p className="mx-auto mt-4 max-w-[30ch] text-center text-p-sm text-foreground/75">{children}</p>
    </li>
  );
}

function Expression({ name, role, children }: { name: string; role: string; children: ReactNode }) {
  return (
    <div className="flex flex-col rounded-xl border border-foreground p-5 [.brand-print_&]:p-4">
      <p className={cn(LABEL, "text-foreground/65")}>{role}</p>
      <p className="mt-2 text-[28px] leading-[30px] font-black tracking-[-0.035em] [.brand-print_&]:text-[25px] [.brand-print_&]:leading-[27px]">{name}</p>
      <p className="mt-3 text-p-sm text-foreground/75">{children}</p>
    </div>
  );
}

export const premise: BrandChapter = {
  slug: "premise",
  number: "01",
  title: "The premise.",
  name: "Premise",
  summary: "A mountain running club in a city with no mountains. Everything else follows from taking that seriously and never explaining the joke.",
  plates: [
    {
      id: "idea",
      title: "Flat is a state of mind.",
      nav: "The idea",
      status: "established",
      lede: "Chicago is flat. People here train for mountain races anyway, on sledding hills and old landfills, one repeat at a time. CMR is the club for that, and the gap between the name and the terrain is the whole brand.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <Frame ground="black" className="flex min-h-[340px] items-end p-8 lg:col-span-6 [.brand-print_&]:min-h-0">
            <TopoPattern className="-z-10 text-(--cmr-contour-on-dark)" />
            <p className="text-[clamp(52px,7.4vw,104px)] leading-[0.9] font-black tracking-[-0.045em] [.brand-print_&]:text-[92px]">
              MAKE YOUR
              <br />
              OWN MTNS
            </p>
          </Frame>
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <Tension a="Urban" b="Alpine">
                Real Chicago places, described in the language of mountains. Cricket Hill gets a summit elevation.
              </Tension>
              <Tension a="Technical" b="Playful">
                The exercise science is sourced and the elevation data is real. The headline above it is a joke.
              </Tension>
              <Tension a="Disciplined" b="Expressive">
                Black, white and one typeface, then a tie-dye circle. The restraint is what makes the color land.
              </Tension>
              <Tension a="Community" b="Individual">
                Everyone climbs the same hill together, each at their own pace and for their own count.
              </Tension>
            </div>
            <Source className="mt-4">Homepage hero and closing statement; .aiom/profile.md (Owner&apos;s brand intent, 2026-08-20).</Source>
          </div>
        </div>
      ),
    },
    {
      id: "today",
      title: "Today, and later.",
      nav: "Today and later",
      status: "inferred",
      lede: "CMR is young, and the brand should sound like it knows that. Write about what exists in the present tense and what is planned in the future tense. Never the other way round.",
      render: () => (
        <div className={cn("grid gap-x-12 gap-y-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-7">
            <Statement label="Purpose" status="proposed" note="Why CMR exists. Drawn from the founder's letter on the About page.">
              Make climbing possible, and a little funny, in a city with nowhere to climb.
            </Statement>
            <Statement label="Mission" status="proposed" note="What CMR does now. Each verb is something the site already does.">
              Find Chicago&apos;s hills, document them honestly, and run them again and again with whoever shows up.
            </Statement>
            <Statement label="Vision" status="proposed" note="Where it is going. An aspiration, not a claim.">
              A Chicago where training for mountains does not mean leaving town.
            </Statement>
            <Statement label="Promise" status="established" note="The tooltip on every Join button, word for word.">
              No fees. No commitments. Lots of elevation.
            </Statement>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="rounded-xl bg-muted p-6 [.brand-print_&]:p-5">
              <h3 className={cn(LABEL, "text-foreground/65")}>True today</h3>
              <ul className="mt-3 space-y-2 text-p-sm text-foreground/85">
                <li>An independent, free, informal running community in Chicago, founded and directed by Michael Whitaker.</li>
                <li>Five hills documented, with terrain drawn from public elevation data.</li>
                <li>The Science: a sourced, long-form guide to hill repeats.</li>
                <li>Joining is open to adults 18 and older.</li>
                <li>Official group runs are on hold while park-use requirements are reviewed.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-dashed border-foreground/50 p-6 [.brand-print_&]:p-5">
              <h3 className={cn(LABEL, "text-foreground/65")}>Planned, not yet real</h3>
              <ul className="mt-3 space-y-2 text-p-sm text-foreground/85">
                <li>A weekly running calendar and group runs.</li>
                <li>Apparel and merchandise.</li>
                <li>Articles, community elevation tracking, member features.</li>
                <li>CMR-created races.</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "audience",
      title: "Who it is for.",
      nav: "Audience",
      status: "established",
      lede: "The founder's letter names three kinds of runner. The fourth circle is everyone who is not a runner at all but still has to understand, permit, print or write about the club.",
      render: () => (
        <>
          <ul className={cn("grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4", PRINT_GROW)}>
            <AudienceCircle i={0} title="People who enjoy climbing.">
              Trail and ultra runners in Chicago who need vertical and have been improvising it alone.
            </AudienceCircle>
            <AudienceCircle i={1} title="People who want to get better at it.">
              Runners with a hilly race on the calendar and a flat city to train in.
            </AudienceCircle>
            <AudienceCircle i={2} title="People who are simply curious.">
              First-timers. No experience with repeats, trails or ultras needed, and no minimum pace.
            </AudienceCircle>
            <AudienceCircle i={3} title="Everyone else.">
              Park staff, partners, vendors and press. They need the plain facts, stated plainly.
            </AudienceCircle>
          </ul>
          <div className={cn("mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="First-timers to ultra-marathoners.">One of the four lines on the About page. The range is the point: never write for only one end of it.</Rule>
            <Rule title="Adults only.">Membership and organized runs are for people 18 and older. Nothing in the brand is aimed at children.</Rule>
            <Rule title="Free.">No dues, no minimum mileage, no attendance requirement. If that ever changes for one activity, it is labeled clearly.</Rule>
          </div>
          <Source className="mt-6">About page, &ldquo;From mountains to molehills.&rdquo;; src/content/faq.ts; Join page essentials.</Source>
        </>
      ),
    },
    {
      id: "personality",
      title: "Serious. Not solemn.",
      nav: "Personality",
      status: "established",
      lede: "The Owner's own description: simple, minimalist, matter-of-fact, witty and slightly sarcastic. The humor comes from calling ourselves Mountain Runners in a city without mountains, and it should not be over-explained.",
      render: () => (
        <>
          <SpecTable
            caption="Brand personality: what CMR is and is not"
            head={["CMR is", "CMR is not", "On the site"]}
            rows={[
              ["Matter-of-fact", "Hyped", "“A park hill in West Ridge that our elevation data hasn't found yet.”"],
              ["Witty", "Wacky", "“Garbage, it turns out, stacks well.” One dry line, then back to the facts."],
              ["Technically literate", "Elitist", "The Science cites its sources. The FAQ says there is no minimum pace."],
              ["Welcoming", "Needy", "“Just show up.” No pitch, no countdown, no urgency."],
              ["Honest about numbers", "Loose with claims", "Every hill figure is marked ≈. Warren Hill shows no figures at all."],
              ["From Chicago", "Generic outdoors", "Montrose, Irving Park, Evanston. No stock ridgelines, no pine trees."],
            ]}
          />
          <div className={cn("mt-10 grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-5", PRINT_BOTTOM)}>
            <Rule title="Show up.">Attendance is the only credential.</Rule>
            <Rule title="Any pace.">Run, jog, hike, or mix it up.</Rule>
            <Rule title="Count honestly.">Approximate means approximate.</Rule>
            <Rule title="Respect the park.">These are shared public places.</Rule>
            <Rule title="Keep it free.">No fee to join the club.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "architecture",
      title: "One brand. Three expressions.",
      nav: "Architecture",
      status: "established",
      lede: "Chicago Mountain Runners is the only brand. Hills on Repeat, Hills on Hills and Get High in the City are things CMR says, not things CMR owns separately. None has its own logo, and none carries a ™.",
      render: () => (
        <>
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,260px)_1fr]">
            <div className="flex flex-col items-center justify-center rounded-xl bg-primary p-6 text-primary-foreground">
              <BrandBadge ink="white" className="w-[150px]" />
              <p className={cn(LABEL, "mt-4 text-center text-[11px] text-primary-foreground/80")}>The master brand</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Expression role="The practice" name="Hills on Repeat">
                Repeated climbs, and the group runs built on them. The navigation label for the running calendar.
              </Expression>
              <Expression role="The places" name="Hills on Hills">
                The directory of Chicago-area hills. The navigation label for it, and a web address of the same name that forwards to the main site.
              </Expression>
              <Expression role="The wink" name="Get High in the City">
                A headline, on the homepage&apos;s hills section. The most irreverent of the three, so it travels least.
              </Expression>
            </div>
          </div>
          <SpecTable
            className="mt-8 [.brand-print_&]:mt-6"
            caption="Usage boundaries for the three CMR expressions"
            head={["Expression", "In use today", "May become", "Never"]}
            rows={[
              ["Hills on Repeat", "Navigation, page title and hero of /calendar.", "A run series name; a line on apparel.", "A separate logo, club or account."],
              ["Hills on Hills", "Navigation and title of /hills; a headline on About; a forwarding domain.", "A map, a zine, a merchandise capsule.", "A second brand competing with the CMR name."],
              ["Get High in the City", "One homepage headline.", "A campaign line; an apparel slogan.", "Navigation, or anywhere near safety, legal or park-facing communication."],
            ]}
          />
          <div className={cn("mt-6 grid gap-4 md:grid-cols-2", PRINT_BOTTOM)}>
            <Pending status="proposed" title="The “may become” and “never” columns are recommendations.">
              The architecture itself is the Owner&apos;s decision (2026-11-13). The boundaries around each expression are proposed here for review.
            </Pending>
            <Pending status="established" title="The Science, Join and About are sections, not expressions.">
              They are parts of the website with plain names. They take the full CMR identity and need no rules of their own.
            </Pending>
          </div>
        </>
      ),
    },
    {
      id: "messaging",
      title: "What we say first.",
      nav: "Messaging",
      status: "inferred",
      lede: "The order the homepage already follows, top to bottom. When there is room for one line, use the first that fits. When there is room for more, keep the order.",
      render: () => (
        <div className={cn("grid gap-x-12 gap-y-8 lg:grid-cols-12", PRINT_GROW)}>
          <ol className="lg:col-span-7">
            {[
              ["Name", "Chicago Mountain Runners", "Always in full on first mention. CMR after that."],
              ["Premise", "Make your own mtns.", "The homepage hero. The idea in four words."],
              ["Descriptor", "A running community for finding elevation, running it repeatedly and occasionally questioning our decisions.", "The homepage statement. “Sanity” is struck through before “decisions.”"],
              ["Invitation", "Just show up.", "The call to action on three pages."],
              ["Proof", "No fees. No commitments. Lots of elevation.", "Then the specifics: five hills, sourced science, any pace."],
              ["Sign-off", "Flat is a state of mind.", "The last line of the homepage. A closer, never an opener."],
            ].map(([k, line, note], i) => (
              <li key={k} className="grid grid-cols-[2rem_1fr] gap-x-4 border-t border-foreground py-4 [.brand-print_&]:py-3">
                <span className="font-mono text-[13px] leading-7 text-foreground/65">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className={cn(LABEL, "text-foreground/65")}>{k}</p>
                  <p className="mt-1 text-[21px] leading-[26px] font-black tracking-[-0.02em] text-balance">{line}</p>
                  <p className="mt-1 text-[13px] leading-[19px] text-foreground/65">{note}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="lg:col-span-5">
            <h3 className={cn(LABEL, "mb-3 text-foreground/65")}>What to call it</h3>
            <SpecTable
              caption="CMR terminology"
              head={["Say", "When"]}
              rows={[
                ["Club", "Everyday use. “Join the club.” “Club totals.”"],
                ["Running community", "Describing what CMR is, in a sentence or a formal introduction."],
                ["Group runs", "The organized activity. Not “events,” “meetups” or “sessions” in a headline."],
                ["Hills, mountains, mtns", "Interchangeably and with a straight face. See Voice."],
              ]}
            />
            <Source className="mt-4">Terminology: Owner decision, 2026-11-13. Order: src/app/page.tsx.</Source>
          </div>
        </div>
      ),
    },
  ],
};
