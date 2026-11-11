import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { FounderStory } from "@/components/about/FounderStory";
import { HillsCard } from "@/components/about/HillsCard";
import { JustShowUp } from "@/components/home/JustShowUp";
import { SITE_NAME } from "@/lib/site";

const description =
  "Chicago Mountain Runners is an independent, open, free running group that finds elevation in a flat city. Meet the founder and the story behind the hills.";

export const metadata: Metadata = {
  title: "About | Chicago Mountain Runners",
  description,
  alternates: { canonical: "/about" },
  openGraph: { siteName: SITE_NAME, title: "About | Chicago Mountain Runners", description, url: "/about", type: "website" },
};

/** About — Figma About / Desktop 1:5412, Tablet 1:5614, Mobile 1:5810. Header and Footer come from the root layout. */
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <FounderStory />
      <HillsCard />
      <JustShowUp />
    </>
  );
}
