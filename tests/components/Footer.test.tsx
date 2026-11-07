import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "@/components/Footer";
import { axeViolations } from "../axe";

describe("Footer", () => {
  it("renders the Figma footer link row in order", () => {
    render(<Footer year={2026} />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    expect(within(nav).getAllByRole("link").map((l) => l.textContent)).toEqual([
      "Find a Run",
      "About",
      "Join Us",
      "Instagram",
      "Strava",
    ]);
  });

  it("hides legal links that have no page yet (Owner decision)", () => {
    render(<Footer year={2026} />);
    expect(screen.queryByText("Privacy")).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Legal" })).not.toBeInTheDocument();
  });

  it("renders legal links once they have an href, and only those", () => {
    render(<Footer year={2026} legal={[{ label: "Privacy", href: "/privacy" }, { label: "Terms" }]} />);
    const legal = screen.getByRole("list", { name: "Legal" });
    expect(within(legal).getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.queryByText("Terms")).not.toBeInTheDocument();
  });

  it("always shows the risk notice and copyright", () => {
    render(<Footer year={2031} />);
    expect(screen.getByText(/Running carries inherent physical risk/)).toBeInTheDocument();
    expect(screen.getByText("© 2031 Chicago Mountain Runners")).toBeInTheDocument();
  });

  it("includes the newsletter signup by default and can omit it", () => {
    const { rerender } = render(<Footer year={2026} />);
    expect(screen.getByRole("heading", { name: "Get the next run in your inbox." })).toBeInTheDocument();
    rerender(<Footer year={2026} newsletter={false} />);
    expect(screen.queryByRole("heading", { name: "Get the next run in your inbox." })).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Footer year={2026} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
