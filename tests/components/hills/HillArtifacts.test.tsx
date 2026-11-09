import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TieDyeWord } from "@/components/TieDyeWord";
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

  it("puts the specs in a filled container with the art, under the new headings", () => {
    const { container } = render(<HillAbout hill={hill("mt-trashmore")} />);
    expect(screen.getByRole("heading", { level: 2, name: "The hill at James Park." })).toBeInTheDocument();
    const specs = container.querySelector('[data-slot="hill-specs"]')!;
    expect(specs.className).toMatch(/rounded-xl/);
    expect(specs.className).toMatch(/bg-muted/);
    expect(specs.querySelector('[data-slot="hill-contour-art"]')).not.toBeNull();
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

  it("applies the tie-dye word to 'hill' or 'mountain' in each About heading, and not to More hills", () => {
    for (const h of hillsWithPages()) {
      const { container, unmount } = render(<HillAbout hill={h} />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent(h.page.aboutHeading);
      const words = heading.querySelectorAll(".cmr-tie-dye-text");
      expect(words, h.slug).toHaveLength(1);
      expect(words[0].textContent).toMatch(/^(hill|mountain)$/i);
      unmount();
      void container;
    }
    const { container } = render(<MoreHills hills={hillsWithPages().slice(1)} />);
    expect(screen.getByRole("heading", { level: 2, name: "More hills on repeat." })).toBeInTheDocument();
    expect(container.querySelector(".cmr-tie-dye-text")).toBeNull();
  });

  it("TieDyeWord is a plain span", () => {
    const { container } = render(<TieDyeWord>hill</TieDyeWord>);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });
});
