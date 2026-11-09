import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ProvisionalBadge } from "@/components/ProvisionalBadge";
import { HillDirectoryList } from "@/components/hills/HillDirectoryList";
import { JustShowUp } from "@/components/home/JustShowUp";
import { isUnverified } from "@/lib/content-status";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { directoryEntries } from "@/lib/hill-directory";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Chicago Hills — Chicago Mountain Runners",
  description:
    "The hills Chicago Mountain Runners climb in a very flat city: Cricket Hill, Warren Hill, Horner Hill, Schiller Hill and Mt. Trashmore.",
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
 */
export default function HillsPage() {
  const entries = directoryEntries(new Date());
  const layout = fluidVars({ "--head-pt": [56, 80, 128], "--head-pb": [48, 64, 96] });
  // 44 on mobile so "Chicago Hills" holds one line in the 345px column.
  const heading = fluidType([44, 96, 144], [42, 88, 129.6]);
  const intro = fluidType([18, 20, 24], [27, 30, 34]);
  const anyUnverified = entries.some((e) => isUnverified(e.hill.status));

  return (
    <>
      <section aria-labelledby="hills-heading" style={layout} className="pt-(--head-pt-a) pb-(--head-pb-a) md:pt-(--head-pt-b) md:pb-(--head-pb-b)">
        <Container>
          <h1 id="hills-heading" style={heading} className={cn(FLUID_TYPE, "font-black tracking-[-0.045em]")}>
            <span className="block whitespace-nowrap">
              Chicago <s>Hills</s>
            </span>{" "}
            <span className="block">Mountains</span>
          </h1>
          <p style={intro} className={cn(FLUID_TYPE, "max-w-[760px] pt-6 font-medium md:pt-8")}>
            The places in and around a very flat city where the ground goes up on purpose. Each one has a page: what we know,
            what we&apos;re still measuring, and when we run it.
          </p>
          {anyUnverified && (
            <p data-slot="content-status" className="mt-6 flex max-w-[760px] flex-wrap items-baseline gap-x-2 gap-y-1 text-p-sm text-muted-foreground">
              <ProvisionalBadge className="text-foreground">Provisional</ProvisionalBadge>
              <span>Hill details are unconfirmed. Rise figures are approximate.</span>
            </p>
          )}
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
