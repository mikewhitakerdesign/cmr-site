import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FlatStateOfMind } from "@/components/home/FlatStateOfMind";
import { JUST_SHOW_UP_COPY, JustShowUp } from "@/components/home/JustShowUp";
import { axeViolations } from "../../axe";

describe("JustShowUp", () => {
  it("renders the heading, the copy and both CTAs to v1 routes", () => {
    render(<JustShowUp />);
    expect(screen.getByRole("heading", { level: 2, name: "JUST SHOW UP." })).toBeInTheDocument();
    expect(
      screen.getByText(
        JUST_SHOW_UP_COPY,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find a Run" })).toHaveAttribute("href", "/calendar");
    expect(screen.getByRole("link", { name: "Join the club" })).toHaveAttribute("href", "/join");
  });

  it("carries the v1.1 copy, including the invitation to join the weekly group runs", () => {
    expect(JUST_SHOW_UP_COPY).toBe(
      "No membership fee. No pace requirement. No complicated initiation ritual. Find a hill, show up and climb it until it means something. Join the club to join the weekly group runs.",
    );
  });

  it("uses the Figma photo decoratively under the 50% gradient and the legibility shade", () => {
    const { container } = render(<JustShowUp />);
    const backdrop = container.querySelector("[aria-hidden]")!;
    expect(backdrop.querySelector("img")?.getAttribute("src")).toContain("just-show-up.jpg");
    expect(backdrop.querySelector("img")).toHaveAttribute("alt", "");
    expect(backdrop.querySelector("[data-slot=mesh-gradient]")).toHaveClass("opacity-50");
    expect(backdrop.querySelector("[data-slot=legibility-shade]")).toBeInTheDocument();
  });

  it("loads its photo lazily (below the fold)", () => {
    const { container } = render(<JustShowUp />);
    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy");
  });

  it("has no axe violations", async () => {
    const { container } = render(<JustShowUp />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("FlatStateOfMind", () => {
  it("reads as one statement, not a heading", () => {
    const { container } = render(<FlatStateOfMind />);
    expect(container.querySelector("p")).toHaveTextContent("FLAT IS A STATE OF MIND.");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("draws the vector topographic pattern decoratively and statically (no cursor effect)", () => {
    const { container } = render(<FlatStateOfMind />);
    const svg = container.querySelector("[data-slot=topo-pattern]")!;
    expect(svg).toHaveAttribute("aria-hidden");
    expect(svg).toHaveAttribute("preserveAspectRatio", "xMidYMid slice");
    const uses = svg.querySelectorAll("use");
    expect(uses).toHaveLength(1);
    expect(uses[0].getAttribute("href")).toBe("/home/topo.svg#topo");
    // Round 2.1: the liquid cursor effect is gone — no filters, masks or scripted state.
    expect(svg.querySelector("filter, mask, defs, feTurbulence")).toBeNull();
    expect(svg.getAttributeNames().filter((n) => n.startsWith("data-") && n !== "data-slot")).toEqual([]);
  });

  it("has no axe violations", async () => {
    const { container } = render(<FlatStateOfMind />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
