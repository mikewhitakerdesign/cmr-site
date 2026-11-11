"use client";

import { useRef, useState } from "react";
import { Container } from "@/components/Container";
import { QuestionsDialog } from "@/components/QuestionsDialog";
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
  const [open, setOpen] = useState(false);
  const linkRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    linkRef.current?.focus();
  };

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
            <button
              ref={linkRef}
              type="button"
              aria-haspopup="dialog"
              onClick={() => setOpen(true)}
              className="cursor-pointer rounded-xs underline decoration-1 underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(--focus-offset)"
            >
              {PAUSE_COPY.linkText}
            </button>
            {PAUSE_COPY.bodyAfterLink}
          </p>
        </Container>
      </section>
      {/* A sibling, not a child: inside the section it would inherit the centred text and the white focus ring. */}
      <QuestionsDialog open={open} onClose={close} />
    </>
  );
}
