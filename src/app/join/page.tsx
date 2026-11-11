import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ContourField } from "@/components/ContourField";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { TopoPattern } from "@/components/home/TopoPattern";
import { JoinForm } from "@/components/join/JoinForm";
import { FLUID_TYPE } from "@/lib/fluid";
import { BODY_TEXT_COLOR, DISPLAY_HEADING, displayLarge, standardH2 } from "@/lib/headings";
import { OFFICIAL_RUNS_ON_HOLD } from "@/lib/permit-hold";
import { HERO_TOP, heroTopVars } from "@/lib/hero-spacing";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Join the club | Chicago Mountain Runners",
  description:
    "Chicago Mountain Runners is a free, informal running community for adults 18 and older. No dues, no minimum pace, no actual mountains. Join for club updates.",
};

/**
 * Membership essentials: the Owner's supporting copy (CMR-JOIN-001 handoff, 2026-11-09).
 * While official meetups are on hold, "Just show up" gives way to the temporary
 * message, so the page never implies scheduled runs are available; the 18+ line
 * stays either way.
 */
const ESSENTIALS: [string, string][] = [
  ["It's free.", "No membership fees, minimum mileage, or attendance requirements."],
  ["Stay in the loop.", "Get emails about upcoming runs, schedule changes, and occasional club news. Unsubscribe whenever you choose."],
  OFFICIAL_RUNS_ON_HOLD
    ? ["For now.", "Official CMR meetups are on hold while we review park-use requirements. We'll share updates when there's news."]
    : ["Just show up.", "You don't have to join before attending an organized run."],
  ["Adults only.", "All club membership and organized runs are for adults 18 and older."],
];

/**
 * Join the club (/join). Hierarchy: hero, membership essentials, the form, and
 * the inline success state (rendered by JoinForm in place of the form).
 * The page is a Server Component; only the form (and the contour canvas) is client code.
 *
 * Hero (Owner direction, 2026-11-09): the homepage hero's layering: the slow
 * topographic WebGL field in light gray lines, under the same baked mesh-gradient
 * wash the homepage hero uses (PhotoBackdrop, 20%). Black type on a near-white
 * ground; the lines are the lightest gray in the system (neutral 300) and the wash
 * is pastel at 20%, so the text keeps ≥ 12:1 contrast everywhere.
 */
export default function JoinPage() {
  return (
    <>
      <section aria-labelledby="join-heading" className="relative isolate overflow-hidden">
        <PhotoBackdrop
          gradientOpacity="20"
          image={
            <div className="absolute inset-0">
              <ContourField
                className="bg-background text-(--cmr-contour-on-light)"
                scale={620}
                levels={7}
                seed={5}
                fallback={<TopoPattern className="text-(--cmr-contour-on-light)" />}
              />
            </div>
          }
        />
        <Container style={heroTopVars()} className={cn(HERO_TOP, "pb-16 md:pb-24")}>
          <h1 id="join-heading" style={displayLarge()} className={cn(FLUID_TYPE, "font-black tracking-[-0.045em] text-balance")}>
            Join the club.
          </h1>
          <p className="mt-6 max-w-[24ch] text-[24px] leading-[1.2] font-semibold tracking-[-0.5px] text-balance md:mt-8 md:max-w-[34ch] md:text-[32px]">
            No dues. No minimum pace. No actual mountains.
          </p>
          <p className="mt-6 max-w-[62ch] text-[18px] leading-[27px] text-foreground/80">
            Chicago Mountain Runners is a free, informal running community for people who enjoy hills, running, and the
            company of other people who enjoy hills and running. Join to receive club updates and announcements. Come to a
            run whenever it works for you. No attendance requirements. No minimum pace. No mountains required.
          </p>
        </Container>
      </section>

      <section aria-labelledby="essentials-heading" className="border-y border-foreground py-14 md:py-20">
        <Container>
          <h2 id="essentials-heading" className="sr-only">
            Membership essentials
          </h2>
          <dl className="border-b border-foreground/30">
            {ESSENTIALS.map(([term, detail]) => (
              <div key={term} className="grid gap-1 border-t border-foreground/30 py-5 md:grid-cols-[260px_minmax(0,1fr)] md:gap-10 md:py-6">
                <dt className="text-[20px] leading-[28px] font-semibold">{term}</dt>
                <dd className="max-w-[68ch] text-[18px] leading-[27px]">{detail}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section id="join" aria-labelledby="form-heading" className="scroll-mt-24 py-14 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <h2 id="form-heading" style={standardH2()} className={cn(FLUID_TYPE, DISPLAY_HEADING, "text-balance")}>
              Count me in.
            </h2>
            <p className={cn("mt-4 max-w-[28ch] text-[18px] leading-[27px] xl:max-w-none xl:whitespace-nowrap", BODY_TEXT_COLOR)}>A couple of details, and you&apos;re officially unofficial.</p>
          </div>
          <div className="max-w-[640px]">
            <JoinForm />
          </div>
        </Container>
      </section>
    </>
  );
}
