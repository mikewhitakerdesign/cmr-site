import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChicagoHills } from "@/components/home/ChicagoHills";
import { hills, listedHills, type Hill } from "@/lib/hills";
import { axeViolations } from "../../axe";

const homeHills = listedHills().slice(0, 5);

describe("ChicagoHills", () => {
  it("renders the heading, copy and the path to all hills", () => {
    render(<ChicagoHills hills={homeHills} />);
    expect(screen.getByRole("heading", { level: 2, name: "Get high in the city." })).toBeInTheDocument();
    expect(screen.getByText(/You don't need mountains to train for mountains\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore all hills" })).toHaveAttribute("href", "/hills");
  });

  it("numbers the five Figma hills in order and links each to its detail route", () => {
    render(<ChicagoHills hills={homeHills} />);
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows.map((r) => r.textContent)).toEqual([
      "01Cricket HillMontrose Beach · Uptown",
      "02Warren HillWarren Park · West Ridge",
      "03Horner HillHorner Park · Irving Park",
      "04Schiller HillSchiller Woods",
      "05Mt. TrashmoreRobert E. James Park · Evanston",
    ]);
    for (const [name, slug] of [
      ["Cricket Hill", "cricket-hill"],
      ["Warren Hill", "warren-hill"],
      ["Horner Hill", "horner-hill"],
      ["Schiller Hill", "schiller-hill"],
      ["Mt. Trashmore", "mt-trashmore"],
    ]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", `/hills/${slug}`);
    }
  });

  it("features the illustrated hill (Mt. Trashmore) and only that one", () => {
    render(<ChicagoHills hills={homeHills} />);
    const featured = document.querySelectorAll("[data-featured]");
    expect(featured).toHaveLength(1);
    expect(featured[0]).toHaveTextContent("Mt. Trashmore");
  });

  it("describes the illustration in alt text and marks its figures unverified", () => {
    render(<ChicagoHills hills={homeHills} />);
    const img = screen.getByRole("img", { name: /3D contour profile of Mt\. Trashmore/ });
    expect(img.getAttribute("alt")).toMatch(/summit elevation 669 ft/);
    expect(within(img.closest("figure")!).getByText("Figures unverified")).toBeInTheDocument();
  });

  it("drops the marker once the illustration's figures are verified", () => {
    const verified: Hill[] = homeHills.map((h) =>
      h.profileIllustration ? { ...h, profileIllustration: { ...h.profileIllustration, status: "verified" } } : h,
    );
    render(<ChicagoHills hills={verified} />);
    expect(screen.queryByText("Figures unverified")).not.toBeInTheDocument();
  });

  it("never shows the scaffold placeholder hill, and asserts no measurements", () => {
    render(<ChicagoHills hills={homeHills} />);
    expect(screen.queryByText("Example Hill")).not.toBeInTheDocument();
    expect(hills.filter((h) => h.status === "provisional").every((h) => h.elevationGainFt === undefined)).toBe(true);
  });

  it("without hills or an illustration, keeps the heading and link and omits the rest", () => {
    render(<ChicagoHills hills={[]} />);
    expect(screen.getByRole("heading", { name: "Get high in the city." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore all hills" })).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ChicagoHills hills={homeHills} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
