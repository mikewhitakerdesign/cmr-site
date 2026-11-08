import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ChicagoHills } from "@/components/home/ChicagoHills";
import { hills, listedHills } from "@/lib/hills";
import { axeViolations } from "../../axe";

const homeHills = listedHills().slice(0, 5);
const rowsList = () => screen.getAllByRole("list").find((l) => l.tagName === "OL")!;
const shownProfile = () => document.querySelector("[data-slot=hill-profiles] [data-active]")!;

describe("ChicagoHills", () => {
  it("renders the heading, copy and the path to all hills", () => {
    render(<ChicagoHills hills={homeHills} />);
    expect(screen.getByRole("heading", { level: 2, name: "Get high in the city." })).toBeInTheDocument();
    expect(screen.getByText(/You don't need mountains to train for mountains\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore all hills" })).toHaveAttribute("href", "/hills");
  });

  it("numbers the five Figma hills in order and links each to its detail route", () => {
    render(<ChicagoHills hills={homeHills} />);
    const rows = within(rowsList()).getAllByRole("listitem");
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
      expect(within(rowsList()).getByRole("link", { name })).toHaveAttribute("href", `/hills/${slug}`);
    }
  });

  it("shows Mt. Trashmore's profile by default, and only that one to assistive tech", () => {
    render(<ChicagoHills hills={homeHills} />);
    expect(shownProfile()).toHaveAttribute("data-hill", "mt-trashmore");
    const all = document.querySelectorAll("[data-slot=hill-profiles] > [data-hill]");
    expect(all).toHaveLength(5);
    for (const el of all) {
      const shown = el.hasAttribute("data-active");
      expect(el.getAttribute("aria-hidden")).toBe(shown ? "false" : "true");
      expect(el.hasAttribute("inert")).toBe(!shown);
    }
    expect(within(rowsList()).getAllByRole("listitem").filter((li) => li.hasAttribute("data-active"))).toHaveLength(1);
  });

  it("previews a hill on mouse hover, but not on touch", () => {
    render(<ChicagoHills hills={homeHills} />);
    const horner = within(rowsList()).getAllByRole("listitem")[2];
    fireEvent.pointerEnter(horner, { pointerType: "touch" });
    expect(shownProfile()).toHaveAttribute("data-hill", "mt-trashmore");
    fireEvent.pointerEnter(horner, { pointerType: "mouse" });
    expect(shownProfile()).toHaveAttribute("data-hill", "horner-hill");
    expect(horner).toHaveAttribute("data-active");
  });

  it("previews a hill when its row receives keyboard focus", async () => {
    const user = userEvent.setup();
    render(<ChicagoHills hills={homeHills} />);
    act(() => within(rowsList()).getByRole("link", { name: "Cricket Hill" }).focus());
    expect(shownProfile()).toHaveAttribute("data-hill", "cricket-hill");
    await user.tab();
    expect(shownProfile()).toHaveAttribute("data-hill", "warren-hill");
  });

  it("offers touch users explicit preview buttons", async () => {
    const user = userEvent.setup();
    render(<ChicagoHills hills={homeHills} />);
    const group = screen.getByRole("group", { name: "Preview a hill profile" });
    const schiller = within(group).getByRole("button", { name: "Schiller Hill" });
    expect(schiller).toHaveAttribute("aria-pressed", "false");
    await user.click(schiller);
    expect(schiller).toHaveAttribute("aria-pressed", "true");
    expect(shownProfile()).toHaveAttribute("data-hill", "schiller-hill");
  });

  it("annotates measured profiles with approximate figures and the rise legend", () => {
    render(<ChicagoHills hills={homeHills} />);
    const fig = within(shownProfile() as HTMLElement);
    const p = hills.find((h) => h.slug === "mt-trashmore")!.profile!;
    expect(p.figures).not.toBeNull();
    expect(fig.getByText("Total rise")).toBeInTheDocument();
    expect(fig.getByText(`≈ ${p.figures!.riseFt} ft`)).toBeInTheDocument();
    expect(fig.getByText(`≈ ${p.figures!.summitFt} ft`)).toBeInTheDocument();
    expect(fig.getByText(/USGS 3DEP elevation data, approximate\. Vertical scale exaggerated\./)).toBeInTheDocument();
    // Round 2.1: no "Steepest side" tag, anywhere.
    expect(document.body.textContent).not.toMatch(/steep/i);
    // Prominence was never computed, so it is never claimed.
    expect(document.body.textContent).not.toMatch(/prominence/i);
  });

  it("shows no figures for the interpretive Warren Hill profile and says why", () => {
    render(<ChicagoHills hills={homeHills} />);
    const warren = document.querySelector("[data-hill=warren-hill]") as HTMLElement;
    expect(warren.querySelector("[data-hill-profile]")).toHaveAttribute("data-hill-profile", "interpretive");
    expect(within(warren).queryByText(/≈/)).not.toBeInTheDocument();
    expect(within(warren).getByText("Not measured yet")).toBeInTheDocument();
    expect(within(warren).getByText(/Illustrative shape.*Vertical scale exaggerated\./)).toBeInTheDocument();
  });

  it("never shows the scaffold placeholder hill, and records no Owner-verified measurements", () => {
    render(<ChicagoHills hills={homeHills} />);
    expect(screen.queryByText("Example Hill")).not.toBeInTheDocument();
    expect(hills.filter((h) => h.status === "provisional").every((h) => h.elevationGainFt === undefined)).toBe(true);
  });

  it("without hills, keeps the heading and link and omits the rest", () => {
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
