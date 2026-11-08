import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClubTotals } from "@/components/home/ClubTotals";
import { CommunityIntro } from "@/components/home/CommunityIntro";
import { clubTotals, type ClubTotals as Totals } from "@/lib/club-totals";
import { axeViolations } from "../../axe";

describe("CommunityIntro", () => {
  it("renders the statement with the struck joke kept in the text", () => {
    const { container } = render(<CommunityIntro />);
    const p = container.querySelector("p")!;
    expect(p).toHaveTextContent(
      "Chicago Mountain RunnersTM is a running community for finding elevation, running it repeatedly and occasionally questioning our sanity decisions.",
    );
    expect(within(p).getByText("sanity").tagName).toBe("S");
    expect(within(p).getByText("TM").tagName).toBe("SUP");
  });

  it("keeps the name in black and sets the description in the muted gray (Round 2)", () => {
    const { container } = render(<CommunityIntro />);
    const desc = container.querySelector("p .text-muted-foreground")!;
    expect(desc.textContent).toMatch(/^is a running community for finding elevation/);
    expect(desc.textContent).not.toMatch(/Chicago Mountain Runners/);
    expect(within(desc as HTMLElement).getByText("sanity").tagName).toBe("S");
  });

  it("keeps the hill mark decorative", () => {
    const { container } = render(<CommunityIntro />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("alt", "");
    expect(img.closest("[aria-hidden]")).not.toBeNull();
    expect(img.getAttribute("src")).toContain("community-mark.png");
  });

  it("has no axe violations", async () => {
    const { container } = render(<CommunityIntro />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("ClubTotals", () => {
  it("renders the Figma figures as a label → value list under an h2", () => {
    render(<ClubTotals totals={clubTotals} />);
    expect(screen.getByRole("heading", { level: 2, name: "2026 club totals." })).toBeInTheDocument();
    const terms = screen.getAllByRole("term").map((t) => t.textContent);
    // Assistive tech gets the final value as text; the rolling digits are aria-hidden.
    const values = screen.getAllByRole("definition").map((d) => d.querySelector(".sr-only")?.textContent);
    expect(terms).toEqual(["Vertical climbed", "Total miles", "Runners on the hills", "Number of runs"]);
    expect(values).toEqual(["132K ft", "2.5K", "2", "240"]);
    for (const d of screen.getAllByRole("definition"))
      for (const el of d.querySelectorAll("[aria-hidden]")) expect(el.closest(".sr-only")).toBeNull();
  });

  it("puts each figure in its own pale tie-dye circle, mint → peach → lavender → blue", () => {
    const { container } = render(<ClubTotals totals={clubTotals} />);
    const circles = [...container.querySelectorAll<HTMLElement>("[data-slot=total]")];
    expect(circles.map((c) => c.style.getPropertyValue("--tie-wash"))).toEqual([
      "var(--cmr-tint-mint-wash)",
      "var(--cmr-tint-peach-wash)",
      "var(--cmr-tint-lavender-wash)",
      "var(--cmr-tint-blue-wash)",
    ]);
    for (const c of circles) {
      expect(c).toHaveClass("rounded-full", "aspect-square");
      expect(c.querySelector(".cmr-tie-dye")).toHaveAttribute("aria-hidden");
    }
  });

  it("keeps the provisional status on the data, without a visible badge (Round 2)", () => {
    expect(clubTotals?.status).toBe("provisional");
    const { container } = render(<ClubTotals totals={clubTotals} />);
    expect(screen.queryByText(/unverified|provisional/i)).not.toBeInTheDocument();
    expect(container.querySelector("section")).toHaveAttribute("data-status", "provisional");
  });

  it("shows verified figures without a marker", () => {
    const verified: Totals = { ...clubTotals!, status: "verified", year: 2027 };
    render(<ClubTotals totals={verified} />);
    expect(screen.getByRole("heading", { name: "2027 club totals." })).toBeInTheDocument();
    expect(screen.queryByText(/unverified/)).not.toBeInTheDocument();
  });

  it("renders nothing when there are no totals", () => {
    const { container, rerender } = render(<ClubTotals totals={null} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ClubTotals totals={{ ...clubTotals!, items: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ClubTotals totals={clubTotals} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
