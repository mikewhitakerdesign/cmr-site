import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { participantWaiver } from "@/content/legal";
import { WAIVER_TITLE } from "@/lib/waiver";

const description =
  "The Participant Waiver and Assumption of Risk for Chicago Mountain Runners, an independent, free, informal adult running community in Illinois. Draft for review.";

export const metadata: Metadata = {
  title: `${WAIVER_TITLE} | Chicago Mountain Runners`,
  description,
  alternates: { canonical: "/participant-waiver" },
  // A draft pending attorney review: not indexed until the Owner approves it and removes the draft note.
  robots: { index: false },
};

export default function Page() {
  return <LegalDocument title={WAIVER_TITLE} doc={participantWaiver} />;
}
