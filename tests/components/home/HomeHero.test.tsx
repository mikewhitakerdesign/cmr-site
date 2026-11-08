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

  it("sets the headline in solid white: no opacity and no halo or shadow", () => {
    render(<HomeHero next={next} now={now} />);
    const classes = screen.getByRole("heading", { level: 1 }).className.split(/\s+/);
    expect(classes.filter((c) => /opacity|text-shadow|\[text-shadow/.test(c))).toEqual([]);
    expect(classes).toEqual(expect.arrayContaining(["font-black", "text-center"])); // typography unchanged
  });

  it("links the CTAs to the v1 routes", () => {
    render(<HomeHero next={next} now={now} />);
    expect(screen.getByRole("link", { name: "Find a Run" })).toHaveAttribute("href", "/calendar");
    expect(screen.getByRole("link", { name: "Join the club" })).toHaveAttribute("href", "/join");
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
    expect(screen.getByRole("link", { name: "Join the club" })).toHaveClass("bg-primary-foreground", "text-primary");
  });

  it("keeps the card's place with no upcoming run, pointing to the calendar instead of inventing one", () => {
    render(<HomeHero next={null} now={now} />);
    const card = screen.getByRole("article", { name: "Schedule coming soon" });
    expect(within(card).getByRole("link", { name: "See the calendar" })).toHaveAttribute("href", "/calendar");
    expect(within(card).queryByRole("time")).not.toBeInTheDocument();
  });

  it("uses the Owner's original photograph as one source and keeps it decorative", () => {
    const { container } = render(<HomeHero next={next} now={now} />);
    // One image for every breakpoint (crops by object-position), not two art-directed rasters.
    expect(container.querySelectorAll("picture")).toHaveLength(0);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toContain("hero.jpg");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("fetchpriority", "high");
    expect(img).not.toHaveAttribute("loading", "lazy");
    expect(img.className).toMatch(/object-\[50%_0%\]/);
    expect(img.className).toMatch(/lg:object-\[50%_77%\]/);
    expect(img.closest("[aria-hidden]")).not.toBeNull();
    expect(container.querySelector("[data-slot=mesh-gradient]")).toHaveClass("opacity-20");
  });

  it("flips each CTA to its opposite on hover, with no border on either filled button", () => {
    render(<HomeHero next={next} now={now} />);
    const primary = screen.getByRole("link", { name: "Find a Run" });
    expect(primary).toHaveClass("hover:bg-primary-foreground", "hover:text-primary");
    const secondary = screen.getByRole("link", { name: "Join the club" });
    expect(secondary).toHaveClass("hover:bg-primary", "hover:text-primary-foreground");
    for (const b of [primary, secondary]) expect(b.className.split(/\s+/).filter((c) => /(^|:)border/.test(c))).toEqual([]);
  });

  it("has no axe violations", async () => {
    const { container } = render(<HomeHero next={next} now={now} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
