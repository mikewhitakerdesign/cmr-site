"use client";

import { Container } from "@/components/Container";
import { QuestionsDialogLink } from "@/components/QuestionsDialogLink";
import { FLUID_TYPE, fluidVars } from "@/lib/fluid";
import { DISPLAY_HEADING, impactH2 } from "@/lib/headings";
import { PAUSE_COPY } from "@/lib/permit-hold";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * "Hills on pause." The second section of /calendar while official runs are on
 * hold (src/lib/permit-hold.ts; Owner direction 2026-11-11). It takes the place
 * of the "See you on the hill." upcoming-runs section and uses its surface,
 * spacing, container and heading size, centred.
 *
 * "send us your questions" opens the Questions form in a centered dialog
 * (QuestionsDialog, sharing the floating Questions panel's form). It is a
 * button, because it acts rather than navigates, styled as an inline text link.
 * Closing the dialog returns focus to it.
 */
export function HillsOnPause() {
  const layout = fluidVars({
    "--up-pt": [48, 64, 96],
    "--up-pb": [56, 64, 96],
  });
  return (
    <>
      <section
        id="pause"
        aria-labelledby="pause-heading"
        data-slot="hills-on-pause"
        style={layout}
        className={cn(
          "bg-primary pt-(--up-pt-a) pb-(--up-pb-a) text-center text-primary-foreground md:pt-(--up-pt-b) md:pb-(--up-pb-b)",
          onDarkSurface,
        )}
      >
        <Container>
          <h2 id="pause-heading" style={impactH2()} className={cn(FLUID_TYPE, DISPLAY_HEADING)}>
            Hills on pause<span className="ss08">.</span>
          </h2>
          <p data-slot="pause-body" className="mx-auto mt-6 max-w-[56ch] text-p md:mt-8">
            {PAUSE_COPY.bodyBeforeLink}
            <QuestionsDialogLink>{PAUSE_COPY.linkText}</QuestionsDialogLink>
            {PAUSE_COPY.bodyAfterLink}
          </p>
        </Container>
      </section>
    </>
  );
}
