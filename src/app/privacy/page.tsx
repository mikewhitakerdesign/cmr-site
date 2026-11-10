import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { privacyPolicy } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | Chicago Mountain Runners",
  // Not indexed until the Owner-approved text is published (src/content/legal.ts).
  robots: privacyPolicy ? undefined : { index: false },
};

export default function Page() {
  return <LegalDocument title="Privacy Policy" doc={privacyPolicy} />;
}
