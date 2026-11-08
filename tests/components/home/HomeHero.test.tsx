import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeHero } from "@/components/home/HomeHero";
import { getUpcomingRuns, runs, type Run } from "@/lib/runs";
import { axeViolations } from "../../axe";

const now = new Date("2026-11-08T04:30:00Z"); // Saturday 22:30 in Chicago
const next = getUpcomingRuns(now, 1)[0];

describe("HomeHero", () => {
  it("renders the single page h1 as designed", () => {
    render(<HomeHero next={next} now={now} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("MAKE YOUR OWN MTNS");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("links the CTAs to the v1 routes", () => {
    render(<HomeHero next={next} now={now} />);
    expect(screen.getByRole("link", { name: "Find a Run" })).toHaveAttribute("href", "/calendar");
    expect(screen.getByRole("link", { name: "Become a Mtn Runner" })).toHaveAttribute("href", "/join");
  });

  it("shows the next run with its Chicago slot, place and detail link", () => {
    render(<HomeHero next={next} now={now} />);
    // Saturday night: this morning's Cricket run has passed, so Wednesday's Horner run is next.
    const card = screen.getByRole("article", { name: "Horner Hell Repeats" });
    expect(within(card).getByText("Next run")).toBeInTheDocument();
    const time = within(card).getByText("WED · 5:30 AM");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("datetime", "2026-11-11T05:30-06:00");
    expect(within(card).getByText("Horner Park")).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: "Run details" })).toHaveAttribute("href", "/calendar/horner-hell-repeats");
  });

  it("shows no visible sample badge, but keeps the run's status on the card (Round 2)", () => {
    render(<HomeHero next={next} now={now} />);
    expect(next.run.status).toBe("provisional");
    const card = screen.getByRole("article");
    expect(card).toHaveAttribute("data-status", "provisional");
    expect(within(card).queryByText(/Sample|unconfirmed/)).not.toBeInTheDocument();
    const verified: Run = { ...runs[1], status: "verified" };
    expect(getUpcomingRuns(now, 1, [verified])[0].run.status).toBe("verified");
  });

  it("pairs a solid black primary CTA with a solid white secondary (Round 2)", () => {
    render(<HomeHero next={next} now={now} />);
    expect(screen.getByRole("link", { name: "Find a Run" })).toHaveClass("bg-primary", "text-primary-foreground");
    expect(screen.getByRole("link", { name: "Become a Mtn Runner" })).toHaveClass("bg-primary-foreground", "text-primary");
  });

  it("keeps the card's place with no upcoming run, pointing to the calendar instead of inventing one", () => {
    render(<HomeHero next={null} now={now} />);
    const card = screen.getByRole("article", { name: "Schedule coming soon" });
    expect(within(card).getByRole("link", { name: "See the calendar" })).toHaveAttribute("href", "/calendar");
    expect(within(card).queryByRole("time")).not.toBeInTheDocument();
  });

  it("art-directs two Figma rasters and keeps the photo decorative", () => {
    const { container } = render(<HomeHero next={next} now={now} />);
    const source = container.querySelector("picture source");
    expect(source).toHaveAttribute("media", "(min-width: 1024px)");
    expect(source?.getAttribute("srcset")).toContain("hero-desktop.jpg");
    const img = container.querySelector("picture img")!;
    expect(img.getAttribute("src")).toContain("hero.jpg");
    expect(img).toHaveAttribute("alt", "");
    expect(img.closest("[aria-hidden]")).not.toBeNull();
    expect(container.querySelector("[data-slot=mesh-gradient]")).toHaveClass("opacity-20");
  });

  it("has no axe violations", async () => {
    const { container } = render(<HomeHero next={next} now={now} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
