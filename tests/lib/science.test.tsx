import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import SciencePage from "@/app/the-science/page";
import { activeSection } from "@/components/SectionNav";
import { BREATHING_OPENING } from "@/components/science/sections/Breathing";
import { SCIENCE_SOURCES, shortCitation, sourceAnchor, sourceNumber } from "@/content/science-sources";
import { primaryNav } from "@/lib/navigation";
import {
  ACCUMULATOR,
  BREATH_PATTERNS,
  GRADE_RANGE,
  SCIENCE_SECTIONS,
  accumulatedGain,
  breathAt,
  cycleSeconds,
  formatFeet,
  formatMeters,
  inclineGeometry,
  parseWhole,
  sectionTone,
} from "@/lib/science";
import { axeViolations } from "../axe";

const ROOT = join(__dirname, "../..");

beforeAll(() => {
  // jsdom has no layout observers or 2D canvas; the page's client islands only need them to exist.
  class Noop {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", Noop);
  vi.stubGlobal("ResizeObserver", Noop);
  Element.prototype.scrollTo = () => {};
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
});

describe("incline geometry (Physics figure)", () => {
  it("relates grade, angle, rise and surface length correctly", () => {
    const g = inclineGeometry(10);
    expect(g.rise).toBe(10);
    expect(g.angleDeg).toBeCloseTo(5.7106, 3);
    expect(g.slopeLength).toBeCloseTo(100.4988, 3);
  });

  it("puts 100 percent at 45 degrees and 0 percent flat", () => {
    expect(inclineGeometry(100).angleDeg).toBeCloseTo(45, 10);
    expect(inclineGeometry(0)).toMatchObject({ rise: 0, angleDeg: 0, slopeLength: 100 });
  });

  it("covers the slopes Minetti et al. measured (0 to 45 percent) by default", () => {
    expect(GRADE_RANGE).toMatchObject({ min: 0, max: 45 });
    expect(inclineGeometry(45).angleDeg).toBeCloseTo(24.2277, 3);
  });
});

describe("elevation accumulator arithmetic and validation", () => {
  it("defaults to the brief's example: 40 ft × 25 repeats = 1,000 ft", () => {
    expect(accumulatedGain(ACCUMULATOR.gain.initial, ACCUMULATOR.repeats.initial)).toBe(1000);
    expect(formatFeet(1000)).toBe("1,000 ft");
    expect(formatMeters(1000)).toBe("305 m");
  });

  it.each([
    ["40", 40],
    [" 40 ", 40],
    ["1,000", 1000],
    ["1", 1],
  ])("accepts %j", (raw, value) => {
    expect(parseWhole(raw, ACCUMULATOR.gain)).toEqual({ ok: true, value });
  });

  it.each(["", "abc", "4.5", "-3", "0", "1001", "1e3", "+5"])("rejects %j with the range message", (raw) => {
    expect(parseWhole(raw, ACCUMULATOR.gain)).toEqual({ ok: false, error: "Enter a whole number from 1 to 1,000." });
  });

  it("limits repeats to 1–200", () => {
    expect(parseWhole("200", ACCUMULATOR.repeats).ok).toBe(true);
    expect(parseWhole("201", ACCUMULATOR.repeats).ok).toBe(false);
  });
});

describe("breathing timeline", () => {
  const box = BREATH_PATTERNS.find((p) => p.id === "box")!;
  const ext = BREATH_PATTERNS.find((p) => p.id === "extended-exhale")!;

  it("uses the brief's example timings", () => {
    expect(box.phases.map((p) => [p.label, p.seconds])).toEqual([
      ["Inhale", 4],
      ["Hold", 4],
      ["Exhale", 4],
      ["Hold", 4],
    ]);
    expect(ext.phases.map((p) => [p.label, p.seconds])).toEqual([
      ["Inhale", 4],
      ["Exhale", 6],
    ]);
    expect(cycleSeconds(box)).toBe(16);
    expect(cycleSeconds(ext)).toBe(10);
  });

  it("finds the phase, the countdown and the cycle at any elapsed time", () => {
    expect(breathAt(box, 0)).toMatchObject({ index: 0, remaining: 4, cycle: 0, progress: 0 });
    expect(breathAt(box, 3999)).toMatchObject({ index: 0, remaining: 1 });
    expect(breathAt(box, 4000)).toMatchObject({ index: 1, remaining: 4 });
    expect(breathAt(box, 12_000).phase.kind).toBe("hold-out");
    expect(breathAt(box, 16_000)).toMatchObject({ index: 0, cycle: 1 });
    expect(breathAt(ext, 4000)).toMatchObject({ index: 1, remaining: 6 });
    expect(breathAt(ext, 9999)).toMatchObject({ index: 1, remaining: 1 });
    expect(breathAt(ext, 10_000)).toMatchObject({ index: 0, cycle: 1 });
    expect(breathAt(ext, -50)).toMatchObject({ index: 0, cycle: 0 });
  });
});

describe("section bar", () => {
  it("uses the brief's labels, in page order", () => {
    expect(SCIENCE_SECTIONS.map((s) => s.label)).toEqual(["Physics", "Physiology", "Training", "Breathing", "The Mind", "Descending", "Workouts", "Sources"]);
    // Fills alternate, starting white: Physics white … Sources black.
    expect(SCIENCE_SECTIONS.map((s) => sectionTone(s.id))).toEqual(["light", "dark", "light", "dark", "light", "dark", "light", "dark"]);
  });

  it("marks the last section whose top has passed the line, and none above the first", () => {
    expect(activeSection([500, 1500, 2500], 300)).toBe(-1);
    expect(activeSection([300, 1300, 2300], 300)).toBe(0);
    expect(activeSection([-900, 100, 1100], 300)).toBe(1);
    expect(activeSection([-3000, -2000, -1000], 300)).toBe(2);
  });
});

describe("sources", () => {
  // The section files, in page order, so citations can be read in reading order.
  const SECTION_FILES = ["Physics", "Physiology", "Training", "Breathing", "TheMind", "Descending", "Workouts", "Sources"];
  const citedInOrder = SECTION_FILES.flatMap((f) => {
    const text = readFileSync(join(ROOT, `src/components/science/sections/${f}.tsx`), "utf8");
    return [...text.matchAll(/<Cite ids=\{\[([^\]]+)\]\}/g)].flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
  });

  it("have unique ids and well-formed DOIs, PubMed and PMC identifiers", () => {
    expect(new Set(SCIENCE_SOURCES.map((s) => s.id)).size).toBe(SCIENCE_SOURCES.length);
    for (const s of SCIENCE_SOURCES) {
      expect(s.doi, s.id).toMatch(/^10\.\d{4,9}\/\S+$/);
      if (s.pmid) expect(s.pmid, s.id).toMatch(/^\d{7,9}$/);
      if (s.pmcid) expect(s.pmcid, s.id).toMatch(/^PMC\d+$/);
      expect(s.year, s.id).toBeGreaterThanOrEqual(2000);
      expect(s.title, s.id).not.toMatch(/—/);
    }
  });

  it("are each cited on the page, and numbered in order of first citation", () => {
    const first = [...new Set(citedInOrder)];
    expect(first).toEqual(SCIENCE_SOURCES.map((s) => s.id));
  });

  it("formats short citations for screen readers", () => {
    expect(shortCitation(SCIENCE_SOURCES[sourceNumber("minetti-2002") - 1])).toBe("Minetti et al., 2002");
    expect(shortCitation(SCIENCE_SOURCES[sourceNumber("sheel-2012") - 1])).toBe("Sheel and Romer, 2012");
    expect(shortCitation(SCIENCE_SOURCES[sourceNumber("pageaux-2016") - 1])).toBe("Pageaux, 2016");
    expect(() => sourceNumber("nope")).toThrow();
  });
});

describe("The Science page", () => {
  it("is in the primary navigation", () => {
    expect(primaryNav.some((i) => i.href === "/the-science" && i.label === "The Science")).toBe(true);
  });

  it("renders the approved hero copy", () => {
    render(<SciencePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The science behind hill repeats?");
    expect(screen.getByText(/^Chicago isn't known for its hills, yet we spend hours running up and down them\. Turns out there's real science behind the physical benefits, and some interesting psychology behind why we keep doing it\.$/)).toBeInTheDocument();
    expect(screen.queryByText(/surprisingly legitimate|examine the evidence/)).not.toBeInTheDocument();
  });

  it("has all eight sections in the brief's order, ending with Sources", () => {
    const { container } = render(<SciencePage />);
    const sections = [...container.querySelectorAll("section[data-slot=science-section]")];
    expect(sections.map((s) => s.id)).toEqual(SCIENCE_SECTIONS.map((s) => s.id));
    expect(sections.map((s) => s.querySelector("h2")!.textContent)).toEqual([
      "Gravity Is Doing Its Job.",
      "Your Legs Have Complaints.",
      "Small Hill. Real Work.",
      "Breathing. It's Kind of Important.",
      "The Art of Doing It Again.",
      "What Goes Up Must Come Down.",
      "Put the Science to Work.",
      "Sources",
    ]);
  });

  it("keeps the approved breathing opening exactly, with nothing added", () => {
    const { container } = render(<SciencePage />);
    const opening = container.querySelector("[data-slot=breathing-opening]")!;
    expect([...opening.querySelectorAll("p")].map((p) => p.textContent)).toEqual([...BREATHING_OPENING]);
    expect(BREATHING_OPENING).toEqual([
      "You've been breathing your entire life. Congratulations. You're probably pretty good at it.",
      "But there's a difference between breathing automatically and breathing intentionally.",
      "Whether you're climbing a mountain at altitude, grinding through your twentieth hill repeat, or trying to convince yourself that another five miles sounds reasonable, the way you breathe can influence how you experience physical effort and stress.",
      "The interesting part is that breathing is both automatic and something you can consciously control. That gives us a direct way to influence certain physiological and psychological responses.",
    ]);
  });

  it("links the section bar to each section, and every citation to an entry under Sources", () => {
    const { container } = render(<SciencePage />);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(SCIENCE_SECTIONS.map((s) => `#${s.id}`));
    const cites = [...container.querySelectorAll("[data-slot=cite] a")];
    expect(cites.length).toBeGreaterThan(30);
    for (const a of cites) expect(container.querySelector(a.getAttribute("href")!), a.getAttribute("href")!).not.toBeNull();
    for (const s of SCIENCE_SOURCES) expect(container.querySelector(`#${sourceAnchor(s.id)}`)).not.toBeNull();
  });

  it("uses no photographs or images, and no em dashes in its text", () => {
    const { container } = render(<SciencePage />);
    expect(container.querySelectorAll("img, picture, video")).toHaveLength(0);
    expect(container.textContent).not.toMatch(/—/);
  });

  it("carries an educational-information disclaimer with the sources", () => {
    const { container } = render(<SciencePage />);
    expect(container.querySelector("#sources [data-slot=science-disclaimer]")).toHaveTextContent(/not medical advice/);
  });

  it("labels each section with its name only (no numbers) and alternates white and black fills", () => {
    const { container } = render(<SciencePage />);
    const sections = [...container.querySelectorAll("section[data-slot=science-section]")];
    expect(sections.map((s) => s.querySelector("[data-slot=science-eyebrow]")!.textContent)).toEqual(SCIENCE_SECTIONS.map((s) => s.label));
    expect(sections.map((s) => s.getAttribute("data-tone"))).toEqual(["light", "dark", "light", "dark", "light", "dark", "light", "dark"]);
    for (const s of sections) expect(s.classList.contains("science-dark")).toBe(s.getAttribute("data-tone") === "dark");
  });

  it("alternates the figure side by section and keeps the text first in reading order", () => {
    const { container } = render(<SciencePage />);
    const firstSide = (id: string) => container.querySelector(`#${id} [data-slot=split-row]`)!.getAttribute("data-figure-side");
    expect(["physics", "physiology", "training", "breathing", "the-mind", "descending"].map(firstSide)).toEqual(["right", "left", "right", "left", "right", "left"]);
    for (const row of container.querySelectorAll("[data-slot=split-row]")) {
      const kids = [...row.children].map((c) => c.getAttribute("data-slot"));
      if (kids.includes("split-figure")) expect(kids[0]).toBe("split-text");
    }
  });

  it("frames every figure in the grayscale tie-dye of the homepage TBD circles", () => {
    const { container } = render(<SciencePage />);
    const figures = [...container.querySelectorAll("[data-slot=science-figure]")];
    expect(figures).toHaveLength(7);
    for (const f of figures) {
      const frame = f.querySelector<HTMLElement>("[data-slot=figure-frame]")!;
      expect(frame.querySelector(".cmr-tie-dye")).not.toBeNull();
      expect(frame.style.getPropertyValue("--tie-wash")).toBe("var(--cmr-tint-gray-wash)");
      expect(frame.className).toMatch(/\bscience-light\b/);
      expect(frame.className).toMatch(/\brounded-2xl\b/);
    }
  });

  it("tells visitors where each interactive figure is, accurately at every width", () => {
    const { container } = render(<SciencePage />);
    const lines = [...container.querySelectorAll("[data-slot=figure-instruction]")];
    expect(lines.map((l) => l.closest("section")!.id)).toEqual(["physics", "training", "breathing"]);
    const phys = lines[0];
    expect(phys.querySelector(".xl\\:hidden")).toHaveTextContent("figure below");
    expect(phys.querySelector(".xl\\:inline")).toHaveTextContent("figure to the right");
    expect(lines[2].querySelector(".xl\\:inline")).toHaveTextContent("figure to the left");
    expect(phys.textContent).toMatch(/Adjust the controls in the .* to explore the relationship between grade, angle, and elevation gain\./);
  });

  it("has no axe violations", async () => {
    const { container } = render(<SciencePage />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
