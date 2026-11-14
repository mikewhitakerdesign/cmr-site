import type { CSSProperties, ReactNode } from "react";
import { BrandBadge } from "@/components/brand/BrandBadge";
import { Frame, Rule, SpecTable } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_GROW, PRINT_ONLY, WEB_ONLY } from "@/components/brand/styles";
import { HillHeroBackground, seedFor } from "@/components/hills/HillHero";
import { SparseContours } from "@/components/brand/SparseContours";
import type { BrandChapter } from "@/lib/brand/manual";
import { onDarkSurface } from "@/lib/surfaces";
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

/** One line of the brand's own description of itself. */
function Statement({ label, children, note }: { label: string; children: ReactNode; note: string }) {
  return (
    <div className="grid gap-x-8 gap-y-2 border-t border-foreground py-5 md:grid-cols-[9rem_1fr] [.brand-print_&]:py-4">
      <p className={cn(LABEL, "pt-1.5 text-foreground/65")}>{label}</p>
      <div>
        <p className="text-[24px] leading-[30px] font-black tracking-[-0.02em] text-balance [.brand-print_&]:text-[22px] [.brand-print_&]:leading-[27px]">{children}</p>
        <p className="mt-1.5 text-[14px] leading-5 text-foreground/65">{note}</p>
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
      lede: "Chicago is flat. People here train for mountain races anyway, on sledding hills and old landfills, one repeat at a time. CMR is the club for that, and the gap between the name and the terrain is the whole brand.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          {/* A plain black surface (not the token-inverting black frame), as the site's own heroes are, so the contour field keeps its black. */}
          <Frame ground="none" className={cn("flex min-h-[340px] items-end bg-primary p-8 text-primary-foreground lg:col-span-6 [.brand-print_&]:min-h-0", onDarkSurface)}>
            {/* The site's own hero background: the slow contour field (still under reduced motion or Pause motion). A still frame in the PDF. */}
            <div aria-hidden className={cn("absolute inset-0 -z-10", WEB_ONLY)}>
              <HillHeroBackground seed={seedFor("brand-premise-idea")} />
            </div>
            <SparseContours className={cn("-z-10", PRINT_ONLY)} strokeWidth={1.25} />
            <p className="text-[clamp(52px,7.4vw,104px)] leading-[0.9] font-black tracking-[-0.045em] [.brand-print_&]:text-[92px]">
              MAKE YOUR
              <br />
              OWN MTNS
            </p>
          </Frame>
          <div className="flex flex-col justify-between lg:col-span-6">
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
        </div>
      ),
    },
    {
      id: "today",
      title: "Today, and later.",
      nav: "Today and later",
      lede: "CMR is young, and the brand should sound like it knows that. Write about what exists in the present tense and what is planned in the future tense.",
      render: () => (
        <div className={cn("grid gap-x-12 gap-y-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-7">
            <Statement label="Purpose" note="Why CMR exists.">
              Making elevation gain fun and accessible for Chicago runners through the joys of hill repeats.
            </Statement>
            <Statement label="What we do" note="Each verb is something the site already does.">
              Find Chicago&apos;s hills, document them honestly, and run them again and again with whoever shows up.
            </Statement>
            <Statement label="Promise" note="The line on every Join button. It is about joining and showing up.">
              No fees. No commitments. Lots of elevation.
            </Statement>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="rounded-xl bg-muted p-6 [.brand-print_&]:p-5">
              <h3 className={cn(LABEL, "text-foreground/65")}>Today</h3>
              <ul className="mt-3 space-y-2 text-p-sm text-foreground/85">
                <li>An independent running community in Chicago, free to join, founded and directed by Michael Whitaker.</li>
                <li>Five hills documented, with terrain from public elevation data, and The Science, a sourced guide to hill repeats.</li>
                <li>Official group runs are on hold while park-use requirements are reviewed.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-dashed border-foreground/50 p-6 [.brand-print_&]:p-5">
              <h3 className={cn(LABEL, "text-foreground/65")}>Planned</h3>
              <ul className="mt-3 space-y-2 text-p-sm text-foreground/85">
                <li>Weekly group runs, once the hold lifts.</li>
                <li>Apparel, and perhaps a membership kit: optional purchases, never a condition of joining.</li>
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
            <Rule title="First-timers to ultra-marathoners.">The range is the point: never write for only one end of it.</Rule>
            <Rule title="Adults only.">Membership and organized runs are for people 18 and older. Nothing in the brand is aimed at children.</Rule>
            <Rule title="Free to show up.">No dues, no minimum mileage, no attendance requirement. Anything CMR sells, like a shirt, is optional and labeled as such.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "personality",
      title: "Serious. Not solemn.",
      nav: "Personality",
      lede: "Simple, minimalist, matter-of-fact, witty and slightly sarcastic. The humor comes from calling ourselves Mountain Runners in a city without mountains, and it should not be over-explained.",
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
            <Rule title="Free to join.">Joining and showing up cost nothing.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "architecture",
      title: "One brand. Three expressions.",
      nav: "Architecture",
      lede: "Chicago Mountain Runners is the brand. Hills on Repeat, Hills on Hills and Get High in the City are things CMR says: expressions of the same identity, with no logos of their own.",
      render: () => (
        <>
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,260px)_1fr]">
            <div className="flex flex-col items-center justify-center rounded-xl bg-primary p-6 text-primary-foreground">
              <BrandBadge ink="white" className="w-[150px]" />
              <p className={cn(LABEL, "mt-4 text-center text-[11px] text-primary-foreground/80")}>The core brand</p>
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
            caption="How the three CMR expressions are used"
            head={["Expression", "In use today", "Where it can go"]}
            rows={[
              ["Hills on Repeat", "Navigation, page title and hero of the running calendar.", "A run series name; a line on apparel."],
              ["Hills on Hills", "Navigation and title of the hills directory; a headline on About; a forwarding domain.", "A map, a zine, a merchandise capsule."],
              ["Get High in the City", "One homepage headline.", "A campaign line or an apparel slogan. Kept away from safety, legal and park-facing communication."],
            ]}
          />
          <p className={cn("mt-6 max-w-[80ch] text-p-sm text-foreground/75", PRINT_BOTTOM)}>
            The Science, Join and About are sections of the website, not expressions. They take the full CMR identity and need no rules of their own.
          </p>
        </>
      ),
    },
    {
      id: "messaging",
      title: "What we say first.",
      nav: "Messaging",
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
                  <p className="mt-1 text-[14px] leading-5 text-foreground/65">{note}</p>
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
          </div>
        </div>
      ),
    },
  ],
};
