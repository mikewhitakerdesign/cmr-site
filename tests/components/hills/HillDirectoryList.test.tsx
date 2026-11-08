import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HillProfile } from "@/components/HillProfile";
import { HillDirectoryList } from "@/components/hills/HillDirectoryList";
import { directoryEntries } from "@/lib/hill-directory";
import { getHill } from "@/lib/hills";
import { axeViolations } from "../../axe";

const NOW = new Date("2026-11-12T18:00:00Z");
const rows = () => within(screen.getByRole("list")).getAllByRole("listitem");
const facts = (row: HTMLElement) =>
  Object.fromEntries([...row.querySelectorAll("dl > div")].map((d) => [d.querySelector("dt")!.textContent, d.querySelector("dd")!.textContent]));

describe("HillDirectoryList (/hills)", () => {
  it("numbers the five hills in order and links each whole row to its page", () => {
    render(<HillDirectoryList entries={directoryEntries(NOW)} />);
    expect(rows().map((r) => r.getAttribute("data-hill"))).toEqual(["cricket-hill", "warren-hill", "horner-hill", "schiller-hill", "mt-trashmore"]);
    expect(rows().map((r) => r.querySelector("span")!.textContent)).toEqual(["01", "02", "03", "04", "05"]);
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

  it("compares rise, surface and CMR runs, without numbers for Warren Hill", () => {
    render(<HillDirectoryList entries={directoryEntries(NOW)} />);
    const [cricket, warren, horner] = rows();
    expect(facts(cricket)).toEqual({ Rise: "≈ 30 ft", Surface: "Grass / paved path", "With CMR": "Saturdays · 5:30 AM" });
    expect(facts(warren)).toEqual({ Rise: "Not measured", Surface: "TBD", "With CMR": "Not yet" });
    expect(facts(horner)).toEqual({ Rise: "≈ 20 ft", Surface: "TBD", "With CMR": "Wednesdays · 5:30 AM" });
  });

  it("shows each approved drawing without labels, as a thumbnail", () => {
    const { container } = render(<HillDirectoryList entries={directoryEntries(NOW)} />);
    const imgs = [...container.querySelectorAll("[data-hill-profile] img")].map((i) => i.getAttribute("src"));
    expect(imgs).toEqual([
      "/hills/cricket-hill-profile.svg",
      "/hills/warren-hill-profile.svg",
      "/hills/horner-hill-profile.svg",
      "/hills/schiller-hill-profile.svg",
      "/hills/mt-trashmore-profile.svg",
    ]);
    expect(container.querySelector("[data-slot=rise-legend]")).toBeNull();
    expect(container.querySelector("figcaption")).toBeNull();
  });

  it("keeps directory numbers in a subset and supports h3 names", () => {
    const more = directoryEntries(NOW).filter((e) => e.hill.slug !== "cricket-hill");
    render(<HillDirectoryList entries={more} headingLevel="h3" />);
    expect(rows()[0].querySelector("span")).toHaveTextContent("02");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
  });

  it("has no axe violations", async () => {
    const { container } = render(<HillDirectoryList entries={directoryEntries(NOW)} />);
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
