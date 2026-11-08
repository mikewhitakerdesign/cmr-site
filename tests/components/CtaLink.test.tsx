import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaLink } from "@/components/CtaLink";
import { JustShowUp } from "@/components/home/JustShowUp";
import { axeViolations } from "../axe";

const classes = (name: string) => screen.getByRole("link", { name }).className.split(/\s+/);

describe("CtaLink (Round 2.1)", () => {
  it.each([
    // variant, rest fill → hover fill, hover label
    ["primary", "bg-primary", "hover:bg-primary-foreground", "hover:text-primary"],
    ["secondary", "bg-primary-foreground", "hover:bg-primary", "hover:text-primary-foreground"],
    ["outline", "bg-transparent", "hover:bg-primary", "hover:text-primary-foreground"],
  ] as const)("%s: 1px border, flips to its opposite on hover", (variant, rest, hoverBg, hoverText) => {
    render(<CtaLink href="/x" variant={variant}>{variant}</CtaLink>);
    const c = classes(variant);
    expect(c).toContain("border");
    expect(c.filter((x) => /^border-\d/.test(x))).toEqual([]); // no thicker border
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

  it("uses the same buttons on Just show up", async () => {
    const { container } = render(<JustShowUp />);
    expect(classes("Find a Run")).toContain("hover:bg-primary-foreground");
    expect(classes("Join Us")).toContain("hover:bg-primary");
    expect(await axeViolations(container)).toEqual([]);
  });
});
