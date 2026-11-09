import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FindTheMountain } from "@/components/hills/FindTheMountain";
import { HillBreadcrumb, HillHero } from "@/components/hills/HillHero";
import { HillLede } from "@/components/hills/HillIntro";
import { HillRuns } from "@/components/hills/HillRuns";
import { HillAbout, HillRepeats } from "@/components/hills/HillTerrain";
import { MoreHills } from "@/components/hills/MoreHills";
import { getHill, otherHills, type HillWithPage } from "@/lib/hills";
import { getRunsAtHill } from "@/lib/runs";
import { axeViolations } from "../../axe";

const NOW = new Date("2026-11-12T18:00:00Z");
const hill = (slug: string) => getHill(slug) as HillWithPage;

function Page({ slug }: { slug: string }) {
  const h = hill(slug);
  return (
    <main>
      <HillHero hill={h} />
      <HillBreadcrumb hill={h} />
      <HillLede hill={h} />
      <HillAbout hill={h} />
      <HillRepeats hill={h} />
      <HillRuns hill={h} runs={getRunsAtHill(slug, NOW)} />
      <FindTheMountain hill={h} />
      <MoreHills hills={otherHills(slug)} />
    </main>
  );
}

const circles = () =>
  Object.fromEntries(
    [...document.querySelectorAll("[data-slot=repeat-circle]")].map((c) => [c.querySelector("dt")!.textContent, c.querySelector("dd")!.textContent]),
  );

describe("hill detail page (refinement pass, PR #4)", () => {
  it("renders the section order with one h1", () => {
    render(<Page slug="cricket-hill" />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "The mountain at Montrose.",
      "How tall is it? How tall you need it?",
      "Run it with us",
      "Find what you've been looking for.",
      "More hills on repeat.",
    ]);
  });

  it("sets the hero name one word per line, with no eyebrow, over the contour background", () => {
    const { container } = render(<HillHero hill={hill("warren-hill")} />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Warren Hill" });
    expect([...h1.querySelectorAll(":scope > span.block")].map((s) => s.textContent)).toEqual(["Warren", "Hill"]);
    expect(container.querySelector("[data-slot=contour-field]")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).not.toMatch(/West Ridge/);
  });

  it("puts the breadcrumb after the hero", () => {
    render(<Page slug="schiller-hill" />);
    const hero = screen.getByRole("heading", { level: 1 }).closest("section")!;
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(hero.compareDocumentPosition(crumbs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hero.contains(crumbs)).toBe(false);
    expect(within(crumbs).getByRole("link", { name: "Chicago Mountains" })).toHaveAttribute("href", "/hills");
    expect(within(crumbs).getByText("Schiller Hill")).toHaveAttribute("aria-current", "page");
  });

  it("shows the lede alone, keeping the content status as data only", () => {
    const { container } = render(<HillLede hill={hill("cricket-hill")} />);
    expect(container.querySelector("section")).toHaveAttribute("data-status", "provisional");
    expect(container.querySelectorAll("p")).toHaveLength(1);
    expect(screen.queryByText("Provisional")).toBeNull();
    expect(screen.queryByText(/primary training hills/)).toBeNull();
    expect(screen.queryByText(/TBD means not measured yet/)).toBeNull();
  });

  it("shows Cricket Hill's four repeat circles, derived from the Owner's baseline, with miles", () => {
    render(<HillRepeats hill={hill("cricket-hill")} />);
    const sr = [...document.querySelectorAll("[data-slot=repeat-circle] dd .sr-only")].map((e) => e.textContent);
    expect(sr).toEqual(["13 repeats, about 2.6 miles", "25 repeats, about 5 miles", "63 repeats, about 12.6 miles", "125 repeats, about 25 miles"]);
    expect([...document.querySelectorAll("[data-slot=repeat-miles]")].map((e) => e.textContent)).toEqual(["2.6 miles", "5 miles", "12.6 miles", "25 miles"]);
    expect(screen.getByText(/The Cricket Hill route is \.2 miles up and down\./)).toBeInTheDocument();
    expect(screen.getByText(/approximations only and based on specific routes mapped by CMR/)).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
  });

  it("keeps the circles for a hill with no mapped route, reading TBD", () => {
    const { container } = render(<HillRepeats hill={hill("warren-hill")} />);
    expect(container.querySelector("section")).toHaveAttribute("data-route", "none");
    expect(Object.values(circles())).toEqual(Array(4).fill("TBDNot counted yetRepeatsTBD"));
    expect(screen.getByText(/CMR hasn't mapped a route on Warren Hill yet/)).toBeInTheDocument();
  });

  it("lists recorded spec rows, the Owner's surface elsewhere, and the sources for the geography", () => {
    const { unmount } = render(<HillAbout hill={hill("cricket-hill")} />);
    expect(screen.getByText("Primary surface").nextSibling).toHaveTextContent("Grass");
    expect(screen.getByRole("link", { name: "Chicago Park District: Cricket Hill" })).toHaveAttribute(
      "href",
      "https://www.chicagoparkdistrict.com/parks-facilities/cricket-hill",
    );
    unmount();
    render(<HillAbout hill={hill("schiller-hill")} />);
    expect(screen.getByText("Surface").nextSibling).toHaveTextContent("Grass/dirt");
    expect(screen.queryByText("Sources")).toBeNull();
  });

  it("links the run held at the hill, from runs data (not the Figma sample)", () => {
    render(<HillRuns hill={hill("cricket-hill")} runs={getRunsAtHill("cricket-hill", NOW)} />);
    expect(screen.getByRole("heading", { level: 3, name: "Cricket Mtn Repeats" })).toBeInTheDocument();
    expect(screen.getByText("Every Saturday · 5:30 AM · Cricket Hill · Montrose Beach")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View run: Cricket Mtn Repeats" })).toHaveAttribute("href", "/calendar/cricket-mtn-repeats");
    expect(screen.getByRole("link", { name: "Find a Run" })).toHaveAttribute("href", "/calendar");
  });

  it("says so when no CMR run uses the hill", () => {
    render(<HillRuns hill={hill("warren-hill")} runs={[]} />);
    expect(screen.getByRole("heading", { level: 3, name: "No set weekly run." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find a Run" })).toHaveAttribute("href", "/calendar");
  });

  it("links directions and the map off-site, in a new tab, to the park", () => {
    render(<FindTheMountain hill={hill("horner-hill")} />);
    const dir = screen.getByRole("link", { name: /Get directions/ });
    expect(dir).toHaveAttribute("href", expect.stringContaining("https://www.google.com/maps/dir/?api=1&destination=Horner%20Park"));
    expect(dir).toHaveAttribute("target", "_blank");
    expect(dir).toHaveAttribute("rel", "noopener noreferrer");
    expect(dir).toHaveAccessibleName("Get directions to Horner Park (opens in a new tab)");
    const map = screen.getByRole("link", { name: /View map/ });
    expect(map).toHaveAccessibleName("View map of Horner Park (opens in a new tab)");
    expect(map).toHaveAttribute("href", expect.stringContaining("/maps/search/"));
    expect(screen.getByText(/not a meeting point/)).toBeInTheDocument();
  });

  it("shows a static map of the place with its attribution", () => {
    render(<FindTheMountain hill={hill("horner-hill")} />);
    const img = screen.getByRole("img", { name: /Street map around Horner Park/ });
    expect(img.getAttribute("src")).toContain("horner-hill.jpg");
    expect(screen.getByRole("link", { name: "OpenStreetMap" })).toHaveAttribute("href", "https://www.openstreetmap.org/copyright");
  });

  it("lists the other hills simply, each row a link to its page", () => {
    render(<MoreHills hills={otherHills("horner-hill")} />);
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("link").map((l) => l.getAttribute("href"))).toEqual([
      "/hills/schiller-hill",
      "/hills/mt-trashmore",
      "/hills/cricket-hill",
      "/hills/warren-hill",
    ]);
    expect(within(list).queryByText(/≈|Grass|weekly/i)).toBeNull();
    expect(screen.getByRole("link", { name: "All hills" })).toHaveAttribute("href", "/hills");
  });

  it.each(["cricket-hill", "warren-hill", "mt-trashmore"])("%s has no axe violations", async (slug) => {
    const { container } = render(<Page slug={slug} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
