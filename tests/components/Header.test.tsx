import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "@/components/Header";
import { COMPACT_ENTER_Y, COMPACT_EXIT_Y, nextCompactState } from "@/components/HeaderShell";
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

  it("renders the Join the club call to action (Round 2)", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Join the club" })).toHaveAttribute("href", "/join");
  });

  it("draws the CTA with a 1px border (like the bar's rule) that flips to black on hover (Round 2.1)", () => {
    render(<Header />);
    const cta = screen.getByRole("link", { name: "Join the club" });
    expect(cta).toHaveClass("border", "border-primary", "bg-transparent");
    expect(cta.className).not.toMatch(/\bborder-2\b/);
    expect(cta).toHaveClass("hover:bg-primary", "hover:text-primary-foreground");
  });

  it("is a sticky banner that turns compact on scroll and back near the top", () => {
    render(<Header />);
    const banner = screen.getByRole("banner");
    expect(banner).toHaveClass("sticky", "top-0");
    expect(banner).not.toHaveAttribute("data-compact");
    const scrollTo = (y: number) =>
      act(() => {
        Object.defineProperty(window, "scrollY", { value: y, configurable: true });
        fireEvent.scroll(window);
        vi.runAllTimers();
      });
    vi.useFakeTimers({ toFake: ["requestAnimationFrame"] });
    try {
      scrollTo(COMPACT_ENTER_Y + 1);
      expect(banner).toHaveAttribute("data-compact");
      scrollTo(COMPACT_EXIT_Y + 1); // inside the hysteresis band: stays compact
      expect(banner).toHaveAttribute("data-compact");
      scrollTo(0);
      expect(banner).not.toHaveAttribute("data-compact");
    } finally {
      vi.useRealTimers();
      Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    }
  });

  it("logo returns to the top when already on the homepage", () => {
    pathname.current = "/";
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<Header />);
    const home = screen.getByRole("link", { name: "Chicago Mountain Runners" });
    expect(home).toHaveAttribute("aria-current", "page");
    const notPrevented = fireEvent.click(home);
    expect(notPrevented).toBe(false); // handled here, no navigation
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
    scroll.mockRestore();
  });

  it("logo navigates normally from other pages and on modified clicks", () => {
    pathname.current = "/about";
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<Header />);
    const home = screen.getByRole("link", { name: "Chicago Mountain Runners" });
    fireEvent.click(home, { metaKey: true });
    expect(scroll).not.toHaveBeenCalled();
    scroll.mockRestore();
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

describe("nextCompactState", () => {
  it("uses hysteresis so scroll anchoring can't toggle it back", () => {
    expect(nextCompactState(false, COMPACT_ENTER_Y)).toBe(false);
    expect(nextCompactState(false, COMPACT_ENTER_Y + 1)).toBe(true);
    expect(nextCompactState(true, COMPACT_EXIT_Y + 1)).toBe(true);
    expect(nextCompactState(true, COMPACT_EXIT_Y)).toBe(false);
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
