import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "@/components/Footer";
import { buildFooterNav } from "@/lib/navigation";
import { axeViolations } from "../axe";

describe("Footer", () => {
  it("renders only the internal links when no social destinations are configured", () => {
    render(<Footer year={2026} />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    expect(within(nav).getAllByRole("link").map((l) => l.textContent)).toEqual(["Find a Run", "About", "FAQ", "Join the club"]);
    expect(screen.queryByRole("link", { name: "Instagram" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Strava" })).not.toBeInTheDocument();
    expect(document.body.innerHTML).not.toMatch(/REPLACE_WITH/i);
  });

  it("renders the full Figma link row, in order, when destinations are configured", () => {
    const links = buildFooterNav({
      instagram: "https://www.instagram.com/chicagomountainrunners",
      strava: "https://www.strava.com/clubs/cmr",
    });
    render(<Footer year={2026} links={links} />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    const rendered = within(nav).getAllByRole("link");
    expect(rendered.map((l) => l.textContent)).toEqual(["Find a Run", "About", "FAQ", "Join the club", "Instagram", "Strava"]);
    expect(rendered[4]).toHaveAttribute("href", "https://www.instagram.com/chicagomountainrunners");
    expect(rendered[5]).toHaveAttribute("href", "https://www.strava.com/clubs/cmr");
  });

  it("hides legal links that have no page yet (Owner decision)", () => {
    render(<Footer year={2026} legal={[{ label: "Privacy" }, { label: "Terms" }]} />);
    expect(screen.queryByText("Privacy")).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Legal" })).not.toBeInTheDocument();
  });

  it("links the three published legal documents by default", () => {
    render(<Footer year={2026} />);
    const legal = screen.getByRole("list", { name: "Legal" });
    expect(within(legal).getAllByRole("link").map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Participation Guidelines", "/participation-guidelines"],
    ]);
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

  it("hides the newsletter block for v1 (Owner, 2026-11-09) but can bring it back", () => {
    const { rerender } = render(<Footer year={2026} />);
    expect(screen.queryByRole("heading", { name: "Get the next run in your inbox." })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Join the list" })).not.toBeInTheDocument();
    rerender(<Footer year={2026} newsletter={{}} />);
    expect(screen.getByRole("heading", { name: "Get the next run in your inbox." })).toBeInTheDocument();
  });

  it("puts Pause motion in the link row, right of the last link", () => {
    render(<Footer year={2026} />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    const toggle = screen.getByRole("button", { name: "Pause motion" });
    expect(nav.contains(toggle)).toBe(false);
    expect(nav.parentElement?.contains(toggle)).toBe(true); // the same row container
    const last = within(nav).getAllByRole("link").at(-1)!;
    expect(last.compareDocumentPosition(toggle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("makes the large wordmark a link back to the top of the page", () => {
    render(<Footer year={2026} />);
    const link = screen.getByRole("link", { name: "Chicago Mountain Runners, back to top" });
    expect(link).toHaveAttribute("href", "#top");
    expect(link.querySelector("[data-slot=cmr-wordmark]")).toHaveAttribute("aria-hidden", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Footer year={2026} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
