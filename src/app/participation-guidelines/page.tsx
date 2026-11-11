import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { participationGuidelines } from "@/content/legal";

export const metadata: Metadata = {
  title: "Participation Guidelines | Chicago Mountain Runners",
  alternates: { canonical: "/participation-guidelines" },
  // Not indexed until the Owner-approved text is published (src/content/legal.ts).
  robots: participationGuidelines ? undefined : { index: false },
};

export default function Page() {
  return <LegalDocument title="Participation Guidelines" doc={participationGuidelines} />;
}
