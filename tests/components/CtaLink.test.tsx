import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaLink } from "@/components/CtaLink";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { HomeHero } from "@/components/home/HomeHero";
import { JustShowUp } from "@/components/home/JustShowUp";
import { getUpcomingRuns } from "@/lib/runs";
import { axeViolations } from "../axe";

const classes = (name: string) => screen.getByRole("link", { name }).className.split(/\s+/);

describe("CtaLink (Round 2.1)", () => {
  it.each([
    // variant, rest fill → hover fill, hover label, border?
    ["primary", "bg-primary", "hover:bg-primary-foreground", "hover:text-primary", false],
    ["secondary", "bg-primary-foreground", "hover:bg-primary", "hover:text-primary-foreground", false],
    ["outline", "bg-transparent", "hover:bg-primary", "hover:text-primary-foreground", true],
    ["outlineOnDark", "bg-transparent", "hover:bg-primary-foreground", "hover:text-primary", true],
  ] as const)("%s: flips to its opposite on hover; border only on the outline", (variant, rest, hoverBg, hoverText, bordered) => {
    render(<CtaLink href="/x" variant={variant}>{variant}</CtaLink>);
    const c = classes(variant);
    const borders = c.filter((x) => /(^|:)border/.test(x));
    // Filled buttons have no border at rest or on hover; the outline has exactly 1px.
    expect(borders.length > 0).toBe(bordered);
    if (bordered) expect(c).toContain("border");
    expect(c.filter((x) => /^border-\d/.test(x))).toEqual([]); // never thicker than 1px
    expect(c).toContain(rest);
    expect(c).toContain(hoverBg);
    expect(c).toContain(hoverText);
  });

  it("black → white, white → black, outline → black", () => {
    render(
      <>
        <CtaLink href="/a" variant="primary">black</CtaLink>
        <CtaLink href="/b" variant="secondary">white</CtaLink>
        <CtaLink href="/c" variant="outline">clear</CtaLink>
      </>,
    );
    // The hover fill is always the opposite of the resting fill's tone.
    expect(classes("black")).toEqual(expect.arrayContaining(["bg-primary", "hover:bg-primary-foreground"]));
    expect(classes("white")).toEqual(expect.arrayContaining(["bg-primary-foreground", "hover:bg-primary"]));
    expect(classes("clear")).toEqual(expect.arrayContaining(["bg-transparent", "hover:bg-primary"]));
  });

  it("keeps a visible, surface-offset focus ring and a disabled state", () => {
    render(<CtaLink href="/x" aria-disabled>go</CtaLink>);
    const c = classes("go");
    expect(c).toEqual(expect.arrayContaining(["focus-visible:ring-3", "focus-visible:ring-ring", "focus-visible:ring-offset-2"]));
    expect(c).toContain("aria-disabled:opacity-50");
  });

  it("uses the same buttons, with the same Join the club label, on Just show up", async () => {
    const { container } = render(<JustShowUp />);
    expect(classes("Find a Run")).toContain("hover:bg-primary-foreground");
    expect(classes("Join the club")).toContain("hover:bg-primary");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("every Join CTA (header, hero, Just show up, footer) reads \"Join the club\" and goes to /join", () => {
    const now = new Date("2026-11-08T04:30:00Z");
    render(
      <>
        <Header />
        <HomeHero next={getUpcomingRuns(now, 1)[0]} now={now} />
        <JustShowUp />
        <Footer />
      </>,
    );
    const joins = screen.getAllByRole("link", { name: "Join the club" });
    expect(joins).toHaveLength(4);
    for (const a of joins) expect(a).toHaveAttribute("href", "/join");
    // The old labels are gone everywhere.
    expect(screen.queryByRole("link", { name: /^(Join Us|Become a Mtn Runner)$/ })).not.toBeInTheDocument();
  });
});
