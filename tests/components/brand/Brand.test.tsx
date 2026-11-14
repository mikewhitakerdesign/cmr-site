import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import BrandLandingPage from "@/app/brand/(manual)/page";
import BrandPrintPage from "@/app/brand/print/page";
import { BrandNav } from "@/components/brand/BrandNav";
import { ChapterOpener, ChapterPager } from "@/components/brand/chapter";
import { ContrastChecker } from "@/components/brand/demos/ContrastChecker";
import { HeadlineCheck } from "@/components/brand/demos/HeadlineCheck";
import { LogoStage } from "@/components/brand/demos/LogoStage";
import { PlacementLab } from "@/components/brand/demos/PlacementLab";
import { Swatch } from "@/components/brand/demos/Swatch";
import { TypeTester } from "@/components/brand/demos/TypeTester";
import { StatusTag, WebPlate } from "@/components/brand/kit";
import { chapters } from "@/content/brand";
import { LANDING_SECTIONS, MANUAL, STATUS, outlineOf, pdfPageMap, plateNumber, type Status } from "@/lib/brand/manual";
import { HEADING_ROLES } from "@/lib/brand/spec";
import { axeViolations } from "../../axe";
import { pathname } from "../../pathname";

const outlines = chapters.map(outlineOf);

afterEach(() => vi.unstubAllGlobals());

describe("BrandNav (the one sticky row)", () => {
  it("shows the landing page's sections on /brand, with Overview as the current chapter", () => {
    pathname.current = "/brand";
    render(<BrandNav chapters={outlines} />);
    const nav = screen.getByRole("navigation", { name: "Brand Standards" });
    for (const s of LANDING_SECTIONS) expect(within(nav).getByRole("link", { name: s.label })).toHaveAttribute("href", `#${s.id}`);
    expect(within(nav).getByRole("button", { name: /Chapters\. Current:.*Overview/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("shows the current chapter's sections on a chapter page", () => {
    pathname.current = "/brand/color";
    render(<BrandNav chapters={outlines} />);
    const nav = screen.getByRole("navigation", { name: "Brand Standards" });
    const color = chapters.find((c) => c.slug === "color")!;
    for (const p of color.plates) expect(within(nav).getByRole("link", { name: p.nav })).toHaveAttribute("href", `#${p.id}`);
    expect(within(nav).getByRole("button", { name: /Current:.*03.*Color/ })).toBeInTheDocument();
    expect(within(nav).queryByRole("link", { name: LANDING_SECTIONS[0].label })).not.toBeInTheDocument();
  });

  it("opens the chapter menu from the button, lists every chapter with the current one marked, and closes on Escape with focus returned", async () => {
    pathname.current = "/brand/voice";
    const user = userEvent.setup();
    render(<BrandNav chapters={outlines} />);
    const button = screen.getByRole("button", { name: /Chapters/ });
    const panel = document.getElementById(button.getAttribute("aria-controls")!)!;
    expect(panel).not.toBeVisible();

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(panel).toBeVisible();
    const links = within(panel).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/brand", ...chapters.map((c) => `/brand/${c.slug}`)]);
    expect(within(panel).getByRole("link", { name: /07\s*Voice/ })).toHaveAttribute("aria-current", "page");
    expect(within(panel).getAllByRole("link", { current: "page" })).toHaveLength(1);

    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(panel).not.toBeVisible();
    expect(button).toHaveFocus();
  });

  it("closes the chapter menu when the pointer goes down outside it", async () => {
    pathname.current = "/brand";
    const user = userEvent.setup();
    render(
      <>
        <BrandNav chapters={outlines} />
        <p>Elsewhere</p>
      </>,
    );
    const button = screen.getByRole("button", { name: /Chapters/ });
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByText("Elsewhere"));
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("offers the complete PDF as a download on the landing page and on every chapter", () => {
    for (const path of ["/brand", ...chapters.map((c) => `/brand/${c.slug}`)]) {
      pathname.current = path;
      const { unmount } = render(<BrandNav chapters={outlines} />);
      const link = screen.getByRole("link", { name: /Download PDF, the complete manual/ });
      expect(link, path).toHaveAttribute("href", MANUAL.pdfHref);
      expect(link, path).toHaveAttribute("download", MANUAL.pdfDownloadName);
      unmount();
    }
  });

  it("has no axe violations, closed or open", async () => {
    pathname.current = "/brand/marks";
    const user = userEvent.setup();
    const { container } = render(<BrandNav chapters={outlines} />);
    expect(await axeViolations(container)).toEqual([]);
    await user.click(screen.getByRole("button", { name: /Chapters/ }));
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("chapter pages", () => {
  it("open with one h1, the summary and a list of the chapter's plates", () => {
    const chapter = chapters[1];
    render(<ChapterOpener chapter={chapter} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(chapter.title);
    expect(screen.getByText(chapter.summary)).toBeInTheDocument();
    const list = screen.getByRole("navigation", { name: "In this chapter" });
    expect(within(list).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(chapter.plates.map((p) => `#${p.id}`));
    expect(screen.getByRole("link", { name: "Brand Standards" })).toHaveAttribute("href", "/brand");
  });

  it("link to the previous and next chapter, and to the overview at either end", () => {
    const { rerender } = render(<ChapterPager chapters={chapters} current={chapters[0]} />);
    let nav = screen.getByRole("navigation", { name: "Chapters" });
    expect(within(nav).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(["/brand", `/brand/${chapters[1].slug}`]);
    rerender(<ChapterPager chapters={chapters} current={chapters[4]} />);
    nav = screen.getByRole("navigation", { name: "Chapters" });
    expect(within(nav).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([`/brand/${chapters[3].slug}`, `/brand/${chapters[5].slug}`]);
    rerender(<ChapterPager chapters={chapters} current={chapters.at(-1)!} />);
    nav = screen.getByRole("navigation", { name: "Chapters" });
    expect(within(nav).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([`/brand/${chapters.at(-2)!.slug}`, "/brand"]);
  });

  for (const chapter of chapters) {
    it(`${chapter.number} ${chapter.name}: every plate renders as a labelled section with its number, status and h2, and passes axe`, async () => {
      const { container } = render(
        <main>
          {chapter.plates.map((p, i) => (
            <WebPlate key={p.id} plate={p} number={plateNumber(chapter, i)} />
          ))}
        </main>,
      );
      const sections = container.querySelectorAll("section[data-slot=brand-plate]");
      expect(sections).toHaveLength(chapter.plates.length);
      chapter.plates.forEach((p, i) => {
        const section = sections[i];
        expect(section.id).toBe(p.id);
        expect(within(section as HTMLElement).getByRole("heading", { level: 2, name: p.title })).toHaveAttribute("id", `${p.id}-heading`);
        expect(section).toHaveTextContent(plateNumber(chapter, i));
        expect(section.querySelector(`[data-status=${p.status}]`)).not.toBeNull();
      });
      // Anchor ids are unique across the whole page (plates, their headings, anything inside them).
      const ids = [...container.querySelectorAll("[id]")].map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(container.querySelectorAll("h1")).toHaveLength(0);
      expect(await axeViolations(container)).toEqual([]);
    });
  }
});

describe("landing page", () => {
  it("has one h1, a section for each sticky-bar anchor, every chapter in order, and two PDF downloads besides the bar's", async () => {
    pathname.current = "/brand";
    const { container } = render(<BrandLandingPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Brand standards.");
    for (const s of LANDING_SECTIONS) expect(container.querySelector(`section#${s.id}`), s.id).not.toBeNull();
    const list = container.querySelector("#chapters ol")!;
    expect([...list.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual(chapters.map((c) => `/brand/${c.slug}`));
    const downloads = screen.getAllByRole("link", { name: /Download PDF/ });
    expect(downloads).toHaveLength(3);
    for (const d of downloads) expect(d).toHaveAttribute("href", MANUAL.pdfHref);
    expect(container).toHaveTextContent(`Version ${MANUAL.version}`);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("explains all four status tags", () => {
    pathname.current = "/brand";
    render(<BrandLandingPage />);
    for (const s of Object.keys(STATUS) as Status[]) expect(screen.getAllByText(STATUS[s].meaning).length).toBeGreaterThan(0);
  });
});

describe("print route (the PDF's source)", () => {
  it("renders exactly the pages the chapter data declares, numbered in order, with the same plates as the website", () => {
    const { container } = render(<BrandPrintPage />);
    const total = pdfPageMap(chapters).total;
    const root = container.querySelector("[data-slot=brand-print]")!;
    expect(root).toHaveAttribute("data-pages", String(total));
    const pages = [...container.querySelectorAll("[data-slot=brand-page]")];
    expect(pages).toHaveLength(total);
    expect(pages.map((p) => Number(p.getAttribute("data-page")))).toEqual(Array.from({ length: total }, (_, i) => i + 1));
    expect(pages[0]).toHaveAttribute("aria-label", "Cover");
    expect(pages[1]).toHaveAttribute("aria-label", "Contents");
    expect(pages.at(-1)).toHaveAttribute("aria-label", "Colophon");
    // Every plate of every chapter is in the PDF, once.
    for (const c of chapters) for (const p of c.plates) expect(container.querySelectorAll(`#${p.id}-heading`).length, `${c.slug}/${p.id}`).toBeGreaterThanOrEqual(1);
    const plateTitles = chapters.flatMap((c) => c.plates.map((p) => p.title));
    const printed = pages.map((p) => p.getAttribute("aria-label")!).filter((l) => /^\d\d\.\d/.test(l));
    expect(printed).toHaveLength(plateTitles.length);
  });

  it("prints the version, the contents with a page number for every chapter, and no interactive control", () => {
    const { container } = render(<BrandPrintPage />);
    const map = pdfPageMap(chapters);
    const contents = container.querySelector('[aria-label="Contents"]')!;
    chapters.forEach((c, i) => {
      expect(contents).toHaveTextContent(c.name);
      expect(contents).toHaveTextContent(String(map.chapters[i].opener).padStart(2, "0"));
    });
    expect(container.querySelector('[aria-label="Cover"]')).toHaveTextContent(`Version ${MANUAL.version}`);
    expect(container.querySelector('[aria-label="Colophon"]')).toHaveTextContent(MANUAL.title);
    // The sticky bar is not part of the PDF.
    expect(container.querySelector("[data-slot=brand-nav]")).toBeNull();
  });
});

describe("StatusTag", () => {
  it("names each evidence level and carries it as data", () => {
    for (const s of Object.keys(STATUS) as Status[]) {
      const { unmount } = render(<StatusTag status={s} />);
      const tag = screen.getByText(STATUS[s].label);
      expect(tag).toHaveAttribute("data-status", s);
      unmount();
    }
  });
});

describe("interactive demonstrations", () => {
  it("Swatch draws the token itself, prints its value, and copies the HEX", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<Swatch color={{ name: "Accent", hex: "#ddffea", cssVar: "accent" }} />);
    const button = screen.getByRole("button", { name: /Accent.*#ddffea.*Copy the HEX value/i });
    expect(button.style.backgroundColor).toBe("var(--accent)");
    await user.click(button);
    expect(writeText).toHaveBeenCalledWith("#ddffea");
    expect(await screen.findByText("Copied #ddffea")).toBeInTheDocument();
  });

  it("Swatch stays usable when the clipboard is unavailable", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    render(<Swatch color={{ name: "Black", hex: "#000000", cssVar: "primary" }} />);
    await user.click(screen.getByRole("button"));
    expect(screen.queryByText(/Copied/)).not.toBeInTheDocument();
    expect(screen.getByText("#000000")).toBeInTheDocument();
  });

  it("ContrastChecker recomputes the ratio and verdicts when either color changes", async () => {
    const user = userEvent.setup();
    const colors = [
      { id: "black", name: "Black", hex: "#000000" },
      { id: "white", name: "White", hex: "#ffffff" },
      { id: "accent", name: "Accent", hex: "#ddffea" },
    ];
    const { container } = render(<ContrastChecker colors={colors} initialText="black" initialGround="white" />);
    const ratio = () => container.querySelector("[data-slot=contrast-ratio]")!.textContent;
    const grade = () => container.querySelector("[data-slot=contrast-grade]")!.textContent;
    expect(ratio()).toBe("21.00:1");
    expect(grade()).toBe("AAA");
    await user.selectOptions(screen.getByLabelText("Text"), "white");
    await user.selectOptions(screen.getByLabelText("Background"), "accent");
    expect(ratio()).toBe("1.07:1");
    expect(grade()).toBe("Fail");
    expect(screen.getAllByText("Fail").length).toBeGreaterThanOrEqual(3);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("HeadlineCheck scores a headline live against the written rules", async () => {
    const user = userEvent.setup();
    const { container } = render(<HeadlineCheck />);
    const score = () => container.querySelector("[data-slot=headline-score]")!.textContent;
    expect(score()).toBe("5 of 5");
    const input = screen.getByLabelText("Your headline");
    await user.clear(input);
    await user.type(input, "Crush It Today!");
    expect(score()).toBe("1 of 5");
    await user.click(screen.getByRole("button", { name: "New here? Good." }));
    expect(input).toHaveValue("New here? Good.");
    expect(score()).toBe("5 of 5");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("TypeTester reports the size a browser would compute for a role at a viewport width", async () => {
    const user = userEvent.setup();
    const { container } = render(<TypeTester />);
    const size = () => container.querySelector("[data-slot=type-tester-size]")!.textContent;
    const impact = HEADING_ROLES.impactH2;
    expect(size()).toBe(`${impact.size[2]} / ${impact.lineHeight[2]} px`);
    await user.click(screen.getByRole("button", { name: /Display XL/ }));
    expect(size()).toBe(`${HEADING_ROLES.displayXL.size[2]} / ${HEADING_ROLES.displayXL.lineHeight[2]} px`);
    expect(screen.getByLabelText("Your line")).toHaveValue(HEADING_ROLES.displayXL.example);
    expect(screen.getByText(/Shown at \d+% to fit this frame/)).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("LogoStage switches ground and clear space with pressed-state buttons", async () => {
    const user = userEvent.setup();
    const { container } = render(<LogoStage />);
    expect(screen.getByRole("button", { name: "White" })).toHaveAttribute("aria-pressed", "true");
    expect(container).toHaveTextContent("x = letter height");
    await user.click(screen.getByRole("button", { name: "Black" }));
    expect(screen.getByRole("button", { name: "Black" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "White" })).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: "Hide" }));
    expect(container).not.toHaveTextContent("x = letter height");
    expect(screen.getByRole("img", { name: "Chicago Mountain Runners" })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("PlacementLab keeps the artwork choices valid for the chosen side and stays marked as proposed", async () => {
    const user = userEvent.setup();
    const { container } = render(<PlacementLab />);
    expect(container.querySelector("[data-slot=brand-tee]")).toHaveAttribute("data-view", "front");
    expect(screen.getByRole("button", { name: "Badge, left chest" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(container.querySelector("[data-slot=brand-tee]")).toHaveAttribute("data-view", "back");
    expect(screen.queryByRole("button", { name: "Badge, left chest" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wordmark" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector("[data-status=proposed]")).not.toBeNull();
    expect(await axeViolations(container)).toEqual([]);
  });
});
