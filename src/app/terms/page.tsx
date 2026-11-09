import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { websiteTerms } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of Use | Chicago Mountain Runners",
  // Not indexed until the Owner-approved text is published (src/content/legal.ts).
  robots: websiteTerms ? undefined : { index: false },
};

export default function Page() {
  return <LegalDocument title="Terms of Use" doc={websiteTerms} />;
}
