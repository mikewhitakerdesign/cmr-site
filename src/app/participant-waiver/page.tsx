import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { participantWaiver } from "@/content/legal";
import { WAIVER_ENABLED, WAIVER_TITLE } from "@/lib/waiver";

const description =
  "The Participation Waiver and Release of Liability for Chicago Mountain Runners, an independent, free, informal adult running community in Illinois.";

export const metadata: Metadata = {
  title: `${WAIVER_TITLE} | Chicago Mountain Runners`,
  description,
  alternates: { canonical: "/participant-waiver" },
  // A draft pending attorney review: not indexed until the Owner approves it and removes the draft note.
  robots: { index: false },
};

export default function Page() {
  // Switched by WAIVER_ENABLED (src/lib/waiver.ts); the v1.1 text is a proposal awaiting Owner approval.
  if (!WAIVER_ENABLED) notFound();
  return <LegalDocument title={WAIVER_TITLE} doc={participantWaiver} />;
}
