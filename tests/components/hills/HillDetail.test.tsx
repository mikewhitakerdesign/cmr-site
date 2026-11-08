import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FindTheMountain } from "@/components/hills/FindTheMountain";
import { HillHero } from "@/components/hills/HillHero";
import { HillLede, HillStats } from "@/components/hills/HillIntro";
import { HillRuns } from "@/components/hills/HillRuns";
import { HillAbout, HillProfileSection, HillRepeats } from "@/components/hills/HillTerrain";
import { getHill, type HillWithPage } from "@/lib/hills";
import { getRunsAtHill } from "@/lib/runs";
import { axeViolations } from "../../axe";

const NOW = new Date("2026-11-12T18:00:00Z");
const hill = (slug: string) => getHill(slug) as HillWithPage;

function Page({ slug }: { slug: string }) {
  const h = hill(slug);
  return (
    <main>
      <HillHero hill={h} />
      <HillLede hill={h} />
      <HillStats hill={h} />
      <HillProfileSection hill={h} />
      <HillAbout hill={h} />
      <HillRepeats hill={h} />
      <HillRuns hill={h} runs={getRunsAtHill(slug, NOW)} />
      <FindTheMountain hill={h} />
    </main>
  );
}

describe("hill detail page (Figma Hill Details 1:6363 / 1:6703 / 1:7032)", () => {
  it("renders the Figma section order with one h1", () => {
    render(<Page slug="cricket-hill" />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Cricket Hill" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "What goes up.",
      "The mountain at Montrose.",
      "Make it taller.",
      "Run it with us",
      "Find the mountain.",
    ]);
  });

  it("uses the approved photograph for Cricket Hill and a drawn hero elsewhere", () => {
    const { container, unmount } = render(<HillHero hill={hill("cricket-hill")} />);
    expect(container.querySelector("section")).toHaveAttribute("data-hero", "photo");
    expect(container.querySelector("img")?.getAttribute("src")).toContain("cricket-hill-hero.jpg");
    unmount();
    const other = render(<HillHero hill={hill("horner-hill")} />);
    expect(other.container.querySelector("section")).toHaveAttribute("data-hero", "drawn");
    expect(other.container.querySelector("img")).toBeNull();
    expect(other.container.querySelector("[data-slot=topo-pattern]")).not.toBeNull();
  });

  it("has a breadcrumb back to the directory", () => {
    render(<HillHero hill={hill("schiller-hill")} />);
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getByRole("link", { name: "Chicago Mtns" })).toHaveAttribute("href", "/hills");
    expect(within(crumbs).getByText("Schiller Hill")).toHaveAttribute("aria-current", "page");
  });

  it("marks the page provisional and says what the numbers are", () => {
    render(<HillLede hill={hill("cricket-hill")} />);
    expect(screen.getByText("Provisional")).toHaveAttribute("data-provisional");
    expect(screen.getByText(/Elevation figures are approximate/)).toBeInTheDocument();
  });

  it("says Warren Hill's drawing is illustrative", () => {
    render(<Page slug="warren-hill" />);
    expect(screen.getByText(/The hill drawing is illustrative/)).toBeInTheDocument();
    expect(screen.getByText("Elevation profile · illustrative")).toBeInTheDocument();
    expect(screen.getByText(/Illustrative shape: Warren Hill/)).toHaveTextContent("Vertical scale exaggerated.");
  });

  it("shows TBD for unmeasured numbers and the recorded surface", () => {
    render(<HillStats hill={hill("cricket-hill")} />);
    const values = Object.fromEntries(
      [...document.querySelectorAll("[data-slot=hill-stat]")].map((c) => [c.querySelector("dt")!.textContent, c.querySelector("dd")!.textContent]),
    );
    expect(values).toEqual({
      "Elevation gain per repeat": "TBD",
      "Repeat distance": "TBD",
      Surface: "Grass / paved path",
      "500 ft of climbing": "TBD repeats",
      "1,000 ft of climbing": "TBD repeats",
    });
  });

  it("counts repeats once gain per repeat exists", () => {
    render(<HillRepeats hill={{ ...hill("horner-hill"), elevationGainFt: 25 }} />);
    expect(screen.getByText("20 repeats")).toBeInTheDocument();
    expect(screen.getByText("40 repeats")).toBeInTheDocument();
    expect(screen.queryByText(/once it's measured/)).toBeNull();
  });

  it("reuses the terrain profile with its approximate figures and caption", () => {
    const { container } = render(<HillProfileSection hill={hill("mt-trashmore")} />);
    expect(container.querySelector("[data-hill-profile=measured] img")).toHaveAttribute("src", "/hills/mt-trashmore-profile.svg");
    expect(container.querySelector("[data-slot=rise-legend]")).toHaveTextContent("≈ 60 ft");
    expect(screen.getByText(/Vertical scale exaggerated\./)).toBeInTheDocument();
  });

  it("lists only recorded spec rows, and the sources for the geography", () => {
    const { unmount } = render(<HillAbout hill={hill("cricket-hill")} />);
    expect(screen.getByText("Primary surface").nextSibling).toHaveTextContent("Grass");
    expect(screen.getByRole("link", { name: "Chicago Park District: Cricket Hill" })).toHaveAttribute(
      "href",
      "https://www.chicagoparkdistrict.com/parks-facilities/cricket-hill",
    );
    unmount();
    render(<HillAbout hill={hill("schiller-hill")} />);
    expect(screen.getByText("Surface").nextSibling).toHaveTextContent("Not recorded yet");
    expect(screen.queryByText("Sources")).toBeNull();
  });

  it("links the run held at the hill, from runs data (not the Figma sample)", () => {
    render(<HillRuns hill={hill("cricket-hill")} runs={getRunsAtHill("cricket-hill", NOW)} />);
    expect(screen.getByRole("heading", { level: 3, name: "Cricket Mtn Repeats" })).toBeInTheDocument();
    expect(screen.getByText("Every Saturday · 5:30 AM · Cricket Hill · Montrose Beach")).toBeInTheDocument();
    expect(screen.getByText("Hill repeats · ~2 hrs")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View run: Cricket Mtn Repeats" })).toHaveAttribute("href", "/calendar/cricket-mtn-repeats");
    expect(screen.getByRole("link", { name: "Find a Run" })).toHaveAttribute("href", "/calendar");
    expect(screen.queryByText(/Tuesday · 6:00 AM/)).toBeNull();
  });

  it("says so when no CMR run uses the hill", () => {
    render(<HillRuns hill={hill("warren-hill")} runs={[]} />);
    expect(screen.getByRole("heading", { level: 3, name: "No group runs here yet." })).toBeInTheDocument();
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
    expect(document.querySelector("[data-slot=map-placeholder]")).toHaveAttribute("aria-hidden", "true");
  });

  it.each(["cricket-hill", "warren-hill", "mt-trashmore"])("%s has no axe violations", async (slug) => {
    const { container } = render(<Page slug={slug} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
