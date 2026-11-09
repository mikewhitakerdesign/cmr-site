import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HillContourArt } from "@/components/hills/HillContourArt";
import { MoreHills } from "@/components/hills/MoreHills";
import { HillAbout, HillRepeats } from "@/components/hills/HillTerrain";
import { getHill, hillsWithPages } from "@/lib/hills";

const hill = (slug: string) => hillsWithPages().find((h) => h.slug === slug)!;

describe("hill page refinements", () => {
  it("draws deterministic, per-hill, decorative contour art", () => {
    const a = render(<HillContourArt slug="cricket-hill" />).container.innerHTML;
    const again = render(<HillContourArt slug="cricket-hill" />).container.innerHTML;
    const b = render(<HillContourArt slug="horner-hill" />).container.innerHTML;
    expect(a).toBe(again);
    expect(a).not.toBe(b);
    expect(a).toContain('aria-hidden="true"');
    expect(a.match(/<path/g)).toHaveLength(8);
  });

  it("puts the specs in a filled container (the art sits above it), under the new headings", () => {
    const { container } = render(<HillAbout hill={hill("mt-trashmore")} />);
    expect(screen.getByRole("heading", { level: 2, name: "The hill at James Park." })).toBeInTheDocument();
    const specs = container.querySelector('[data-slot="hill-specs"]')!;
    expect(specs.className).toMatch(/rounded-xl/);
    expect(specs.className).toMatch(/bg-muted/);
    expect(specs.querySelector('[data-slot="hill-contour-art"]')).toBeNull();
    expect(container.querySelector('[data-slot="hill-contour-art"]')).not.toBeNull();
    expect(screen.getByText("Know what you're running")).toBeInTheDocument();
    expect(getHill("cricket-hill")!.page!.aboutHeading).toBe("The hill at Montrose.");
  });

  it("fills the TBD circles with the neutral tie-dye, not a dashed outline", () => {
    const { container } = render(<HillRepeats hill={hill("horner-hill")} />);
    const circles = container.querySelectorAll('[data-slot="repeat-circle"]');
    expect(circles).toHaveLength(4);
    for (const c of circles) {
      expect(c.getAttribute("style")).toContain("--cmr-tint-gray-wash");
      expect(c.className).not.toMatch(/border-dashed/);
      expect(c.querySelector(".cmr-tie-dye")).not.toBeNull();
      expect(c).toHaveTextContent("TBD");
    }
  });

  it("About headings are plain black text: no tie-dye fill on 'hill' or 'mountain' (Owner, 2026-11-09)", () => {
    for (const h of hillsWithPages()) {
      const { unmount } = render(<HillAbout hill={h} />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent(h.page.aboutHeading);
      expect(heading.querySelector("span")).toBeNull();
      expect(heading.className).not.toMatch(/tie-dye/);
      unmount();
    }
    const { container } = render(<MoreHills hills={hillsWithPages().slice(1)} />);
    expect(screen.getByRole("heading", { level: 2, name: "More hills on repeat." })).toBeInTheDocument();
    expect(container.querySelector("[class*=tie-dye-text]")).toBeNull();
  });

  it("puts the contour drawing above the gray specs block, not inside it", () => {
    const h = hillsWithPages()[0];
    const { container } = render(<HillAbout hill={h} />);
    const art = container.querySelector("[data-slot=hill-contour-art]")!;
    const specs = container.querySelector("[data-slot=hill-specs]")!;
    expect(specs.contains(art)).toBe(false);
    expect(art.compareDocumentPosition(specs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
