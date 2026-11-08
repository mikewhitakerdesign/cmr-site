import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FlatStateOfMind } from "@/components/home/FlatStateOfMind";
import { JustShowUp } from "@/components/home/JustShowUp";
import { axeViolations } from "../../axe";

describe("JustShowUp", () => {
  it("renders the heading, the copy and both CTAs to v1 routes", () => {
    render(<JustShowUp />);
    expect(screen.getByRole("heading", { level: 2, name: "JUST SHOW UP." })).toBeInTheDocument();
    expect(
      screen.getByText(
        "No membership fee. No pace requirement. No complicated initiation ritual. Find a run, show up and climb the same hill until it means something.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find a Run" })).toHaveAttribute("href", "/calendar");
    expect(screen.getByRole("link", { name: "Join Us" })).toHaveAttribute("href", "/join");
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

  it("draws the vector topographic pattern decoratively, static until the client opts in", () => {
    const { container } = render(<FlatStateOfMind />);
    const svg = container.querySelector("[data-slot=topo-field]")!;
    expect(svg).toHaveAttribute("aria-hidden");
    expect(svg).toHaveAttribute("preserveAspectRatio", "xMidYMid slice");
    const uses = svg.querySelectorAll("use");
    expect(uses[0].getAttribute("href")).toBe("/home/topo.svg#topo");
    // jsdom has no fine pointer: the liquid layer and filter never mount.
    expect(svg).not.toHaveAttribute("data-live");
    expect(uses).toHaveLength(1);
    expect(svg.querySelector("filter")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(<FlatStateOfMind />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
