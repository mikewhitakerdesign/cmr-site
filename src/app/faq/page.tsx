import type { Metadata } from "next";
import { Faq } from "@/components/faq/Faq";

export const metadata: Metadata = {
  title: "Frequently Asked | Chicago Mountain Runners",
  description: "Everything you need to know about running with Chicago Mountain Runners: the club, running with us, schedules and safety, and staying connected.",
};

export default function FaqPage() {
  return <Faq />;
}
