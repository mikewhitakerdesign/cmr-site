import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Header from "@/components/Header";
import { isActivePath } from "@/components/NavLink";
import { axeViolations } from "../axe";
import { pathname } from "../pathname";

describe("Header", () => {
  it("links the logo home with an accessible name", () => {
    render(<Header />);
    const home = screen.getByRole("link", { name: "Chicago Mountain Runners" });
    expect(home).toHaveAttribute("href", "/");
  });

  it("renders the approved Figma labels on the existing v1 routes, in order", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => [l.textContent, l.getAttribute("href")])).toEqual([
      ["Find a Run", "/calendar"],
      ["Chicago Hills Mtns", "/hills"],
      ["About", "/about"],
    ]);
    // The joke is visual: "Hills" is struck through, but stays in the accessible name.
    expect(within(nav).getByText("Hills").tagName).toBe("S");
  });

  it("omits the out-of-scope Apparel item (Owner decision)", () => {
    render(<Header />);
    expect(screen.queryByText(/apparel|shirts/i)).not.toBeInTheDocument();
  });

  it("renders the Join Us call to action", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Join Us" })).toHaveAttribute("href", "/join");
  });

  it("marks the current section, including on child routes", () => {
    pathname.current = "/hills/example-hill";
    render(<Header />);
    expect(screen.getByRole("link", { name: "Chicago Hills Mtns" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Find a Run" })).not.toHaveAttribute("aria-current");
  });

  it("accepts custom items and CTA", () => {
    render(<Header items={[{ label: "Runs", href: "/runs" }]} cta={{ label: "Show up", href: "/join" }} />);
    expect(screen.getByRole("link", { name: "Runs" })).toHaveAttribute("href", "/runs");
    expect(screen.getByRole("link", { name: "Show up" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Header />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("isActivePath", () => {
  it.each([
    ["/calendar", "/calendar", true],
    ["/calendar/hill-repeats", "/calendar", true],
    ["/calendars", "/calendar", false],
    ["/", "/", true],
    ["/about", "/", false],
    [null, "/about", false],
  ])("%s on %s → %s", (path, href, expected) => {
    expect(isActivePath(path, href)).toBe(expected);
  });
});
