import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { TopoPattern } from "@/components/home/TopoPattern";
import { JoinForm } from "@/components/join/JoinForm";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { BODY_TEXT_COLOR, DISPLAY_HEADING, displayHeading } from "@/lib/headings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Join the club | Chicago Mountain Runners",
  description:
    "Chicago Mountain Runners is a free, informal running community for adults 18 and older. No dues, no minimum pace, no actual mountains. Join for club updates.",
};

const LABEL = "font-mono text-[13px] leading-5 tracking-[0.1em] uppercase";

/**
 * What membership means, in plain words. Every line is an approved membership
 * decision (CMR-JOIN-001 as stated by the Owner, 2026-11-09); nothing here is
 * an operating claim about runs, permits, insurance or safety.
 */
const ESSENTIALS: [string, string][] = [
  ["Free", "No dues."],
  ["Adults only", "Membership and organized runs are for adults 18 and older."],
  ["Optional", "You don't have to be a member to come to a regular run. Joining is just a way to stay connected."],
  ["No requirements", "No minimum pace. No attendance requirements. Workouts are informal and self-directed."],
  ["Emails", "Members get club announcements: runs, changes and the occasional bit of community news. You can unsubscribe at any time."],
];

/**
 * Join the club (/join). Hierarchy: hero, membership essentials, the form, and
 * the inline success state (rendered by JoinForm in place of the form).
 * The page is a Server Component; only the form is client code.
 */
export default function JoinPage() {
  return (
    <>
      <section aria-labelledby="join-heading" className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 -z-10 w-full opacity-60 md:w-[62%] [mask-image:linear-gradient(to_right,transparent,black_55%)]"
        >
          <TopoPattern className="text-(--cmr-contour-on-light)" />
        </div>
        <Container className="pt-12 pb-16 md:pt-20 md:pb-24">
          <h1 id="join-heading" style={fluidType([56, 104, 144], [52, 96, 130])} className={cn(FLUID_TYPE, "font-black tracking-[-0.045em] text-balance")}>
            JOIN THE CLUB.
          </h1>
          <p className="mt-6 max-w-[24ch] text-[24px] leading-[1.2] font-semibold tracking-[-0.5px] text-balance md:mt-8 md:max-w-[34ch] md:text-[32px]">
            No dues. No minimum pace. No actual mountains.
          </p>
          <p className={cn("mt-6 max-w-[62ch] text-[18px] leading-[27px]", BODY_TEXT_COLOR)}>
            Chicago Mountain Runners is a free, informal running community for people who enjoy hills, running, and the
            company of other people who enjoy hills and running. Join to receive club updates and announcements. Come to a
            run whenever it works for you. No attendance requirements. No minimum pace. No mountains required.
          </p>
        </Container>
      </section>

      <section aria-labelledby="essentials-heading" className="border-y border-foreground py-14 md:py-20">
        <Container>
          <h2 id="essentials-heading" style={displayHeading()} className={cn(FLUID_TYPE, DISPLAY_HEADING)}>
            The basics<span className="ss08">.</span>
          </h2>
          <dl className="mt-10 border-b border-foreground/30 md:mt-14">
            {ESSENTIALS.map(([term, detail]) => (
              <div key={term} className="grid gap-1 border-t border-foreground/30 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 md:py-6">
                <dt className={LABEL}>{term}</dt>
                <dd className="max-w-[68ch] text-[18px] leading-[27px]">{detail}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section id="join" aria-labelledby="form-heading" className="scroll-mt-24 py-14 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="form-heading" style={fluidType([44, 56, 72], [44, 56, 68])} className={cn(FLUID_TYPE, DISPLAY_HEADING)}>
            Sign up<span className="ss08">.</span>
          </h2>
          <div className="max-w-[640px]">
            <JoinForm />
          </div>
        </Container>
      </section>
    </>
  );
}
