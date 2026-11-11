import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { HillSuggestionLink } from "@/components/hills/HillSuggestionLink";
import { HillDirectoryList } from "@/components/hills/HillDirectoryList";
import { JustShowUp } from "@/components/home/JustShowUp";
import { FLUID_TYPE, fluidVars } from "@/lib/fluid";
import { BODY_TEXT_COLOR, displayLarge } from "@/lib/headings";
import { directoryEntries } from "@/lib/hill-directory";
import { HERO_TOP_PX } from "@/lib/hero-spacing";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hills on Hills | Chicago Mountain Runners",
  description:
    "Explore Chicago area hills and places to train. The hills Chicago Mountain Runners climb in a very flat city: Cricket Hill, Warren Hill, Horner Hill, Schiller Hill and Mt. Trashmore.",
  alternates: { canonical: "/hills" },
};

/** "Weekly with CMR" depends on the runs' upcoming dates, so regenerate hourly (as the homepage). */
export const revalidate = 3600;

/**
 * /hills — the Chicago Hills directory (IA: "What hills does CMR use, and which
 * interests me?"; primary action: open a hill).
 *
 * No Figma frame exists for this page (the file has Hill Details only). It is
 * composed from approved parts: the Hill Details display type for the page
 * head, the homepage hill list extended into a comparison (HillDirectoryList),
 * and the homepage's "Just show up." band to close.
 *
 * Refinement pass (Owner direction, 2026-11-08): no eyebrow; the headline is
 * "Chicago H̶i̶l̶l̶s̶ / Mountains" with "Mountains" always on its own second line;
 * the rise footnote under the list is removed; the closing band is the
 * homepage JustShowUp (was "Pick a hill. Show up.").
 *
 * Final pass (Owner direction, 2026-11-09): the provisional tag and note are
 * gone (every hill stays `provisional` in its data and rows carry
 * `data-status`); the intro uses the body-text color of the Cricket Hill description
 * (BODY_TEXT_COLOR).
 */
export default function HillsPage() {
  const entries = directoryEntries(new Date());
  const layout = fluidVars({ "--head-pt": HERO_TOP_PX, "--head-pb": [48, 64, 96] });
  const heading = displayLarge();

  return (
    <>
      <section aria-labelledby="hills-heading" style={layout} className="pt-(--head-pt-a) pb-(--head-pb-a) md:pt-(--head-pt-b) md:pb-(--head-pb-b)">
        <Container>
          <h1 id="hills-heading" style={heading} className={cn(FLUID_TYPE, "font-black tracking-[-0.045em]")}>
            <span className="lg:block">Hills on hills</span> <span className="lg:block">on hills<span className="ss08">.</span></span>
          </h1>
          <p className={cn("max-w-[600px] pt-6 text-[18px] leading-[27px] md:pt-8", BODY_TEXT_COLOR)}>
            The places in and around a very flat city where the ground goes up on purpose. Each one has a page: what we know,
            what we&apos;re still measuring, and when we run it.
          </p>
          <p className={cn("max-w-[600px] pt-4 text-[18px] leading-[27px]", BODY_TEXT_COLOR)}>
            We&apos;re adding more hills as time and our legs allow. Got a hill we should consider adding to this directory?{" "}
            <HillSuggestionLink>We&apos;d love to hear about it.</HillSuggestionLink>
          </p>
        </Container>
      </section>

      <section aria-label="All hills" className="pb-16 md:pb-24">
        <Container>
          <HillDirectoryList entries={entries} />
        </Container>
      </section>

      <JustShowUp />
    </>
  );
}
