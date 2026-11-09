import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HillProfile } from "@/components/HillProfile";
import { HillDirectoryList } from "@/components/hills/HillDirectoryList";
import { directoryEntries } from "@/lib/hill-directory";
import { runs as allRuns } from "@/lib/runs";
import { getHill } from "@/lib/hills";
import { axeViolations } from "../../axe";

const NOW = new Date("2026-11-12T18:00:00Z");
const rows = () => within(screen.getByRole("list")).getAllByRole("listitem");
const facts = (row: HTMLElement) =>
  Object.fromEntries([...row.querySelectorAll("dl > div")].map((d) => [d.querySelector("dt")!.textContent, d.querySelector("dd")!.textContent]));

describe("HillDirectoryList (/hills)", () => {
  it("lists the five hills in order, unnumbered, and links each whole row to its page", () => {
    render(<HillDirectoryList entries={directoryEntries(NOW, allRuns)} />);
    expect(rows().map((r) => r.getAttribute("data-hill"))).toEqual(["cricket-hill", "warren-hill", "horner-hill", "schiller-hill", "mt-trashmore"]);
    for (const r of rows()) expect(r.textContent).not.toMatch(/\b0[1-5]\b/);
    for (const r of rows()) {
      const links = within(r).getAllByRole("link");
      expect(links).toHaveLength(1); // one link per row; the ::after makes the row clickable
      expect(links[0]).toHaveAttribute("href", `/hills/${r.getAttribute("data-hill")}`);
    }
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Cricket Hill",
      "Warren Hill",
      "Horner Hill",
      "Schiller Hill",
      "Mt. Trashmore",
    ]);
  });

  it("compares rise, surface and weekly CMR runs, without numbers for Warren Hill", () => {
    render(<HillDirectoryList entries={directoryEntries(NOW, allRuns)} />);
    const [cricket, warren, horner] = rows();
    expect(facts(cricket)).toEqual({ Rise: "≈ 30 ft", Surface: "Grass/dirt", "Weekly with CMR": "Saturdays · 5:30 AM" });
    expect(facts(warren)).toEqual({ Rise: "Not measured", Surface: "Grass/dirt", "Weekly with CMR": "No set weekly run" });
    expect(facts(horner)).toEqual({ Rise: "≈ 20 ft", Surface: "Grass/dirt", "Weekly with CMR": "Wednesdays · 5:30 AM" });
  });

  it("has no drawings and no visible provisional marker; status stays on each row (final pass)", () => {
    const { container } = render(<HillDirectoryList entries={directoryEntries(NOW, allRuns)} />);
    expect(container.querySelector("[data-hill-profile], img, svg[role=img]")).toBeNull();
    expect(screen.queryByText(/provisional/i)).toBeNull();
    for (const r of rows()) expect(r).toHaveAttribute("data-status", "provisional");
  });

  it("has one shared, decorative hover layer for all rows, not one per row", () => {
    const { container } = render(<HillDirectoryList entries={directoryEntries(NOW, allRuns)} />);
    const layers = container.querySelectorAll("[data-slot=directory-hover-field]");
    expect(layers).toHaveLength(1);
    expect(layers[0]).toHaveAttribute("aria-hidden", "true");
    expect(layers[0].closest("li")).toBeNull();
    // Nothing is created until a row is hovered or focused.
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("supports h3 names", () => {
    const more = directoryEntries(NOW, allRuns).filter((e) => e.hill.slug !== "cricket-hill");
    render(<HillDirectoryList entries={more} headingLevel="h3" />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
  });

  it("has no axe violations", async () => {
    const { container } = render(<HillDirectoryList entries={directoryEntries(NOW, allRuns)} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("HillProfile annotated={false}", () => {
  it("draws the artwork only", () => {
    const h = getHill("cricket-hill")!;
    const { container } = render(<HillProfile name={h.name} profile={h.profile!} annotated={false} caption={false} />);
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.textContent).toBe("");
  });
});
