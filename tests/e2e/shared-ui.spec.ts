import { expect, test, type Locator, type Page } from "@playwright/test";

const AXE_PATH = require.resolve("axe-core");

// Figma measurements per frame (Home / Mobile 393, Tablet 768, Desktop).
// Desktop content is a 1400px container centred in the viewport, 48px padding.
const FIGMA = {
  mobile: { headerH: 144, logo: [24, 12, 100], cta: [259, 18, 110], linksY: 102, linkPx: 13, formH: 48, headingPx: 28, footerBorder: false },
  tablet: { headerH: 122, logo: [48, 17, 128], cta: [592, 32, 128], linksY: 76, linkPx: 14, formH: 48, headingPx: 30, footerBorder: false },
  desktop: { headerH: 122, logo: [68, 12, 188], cta: [1222, 43, 150], linksY: 51, linkPx: 14, formH: 44, headingPx: 30, footerBorder: true },
} as const;

type Spec = (typeof FIGMA)[keyof typeof FIGMA];
const spec = (name: string): Spec => FIGMA[name as keyof typeof FIGMA];
const box = async (l: Locator) => (await l.boundingBox())!;
const css = (l: Locator, prop: string) => l.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

async function axe(page: Page, selector: string) {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async (sel) => {
    // @ts-expect-error injected global
    const r = await window.axe.run(sel, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] });
    return r.violations.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  }, selector);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/about");
  await page.evaluate(() => document.fonts.ready);
});

test.describe("header", () => {
  test("matches Figma geometry", async ({ page }, info) => {
    const s = spec(info.project.name);
    const header = page.locator("header");
    expect(Math.round((await box(header)).height)).toBe(s.headerH);

    const logo = await box(page.getByRole("link", { name: "Chicago Mountain Runners" }));
    expect(Math.round(logo.x)).toBe(s.logo[0]);
    expect(Math.round(logo.y)).toBe(s.logo[1]);
    expect(Math.round(logo.width)).toBe(s.logo[2]);
    expect(logo.width / logo.height).toBeCloseTo(188 / 98, 1);

    const cta = await box(page.getByRole("banner").getByRole("link", { name: "Join Us" }));
    expect(Math.round(cta.width)).toBe(s.cta[2]);
    expect(Math.round(cta.height)).toBe(36);
    // Desktop: 1440 viewport → 1400 container + 48px padding puts the CTA's
    // right edge at 1372 (Figma: 48px inside the container edge).
    expect(Math.round(cta.x)).toBe(s.cta[0]);
    expect(Math.round(cta.y)).toBe(s.cta[1]);

    const nav = page.getByRole("navigation", { name: "Primary" });
    const first = nav.getByRole("link").first();
    expect(Math.round((await box(first)).y)).toBe(s.linksY);
    expect(await css(first, "font-size")).toBe(`${s.linkPx}px`);

    if (info.project.name === "desktop") {
      // Single row with space-between: links sit clear of both logo and CTA.
      const links = await box(nav);
      expect(links.x).toBeGreaterThan(logo.x + logo.width + 100);
      expect(links.x + links.width).toBeLessThan(cta.x - 100);
    }
  });

  test("desktop links are 80% opacity except the current page", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "opacity treatment is desktop-only in Figma");
    const nav = page.getByRole("navigation", { name: "Primary" });
    expect(await css(nav.getByRole("link", { name: "Find a Run" }), "opacity")).toBe("0.8");
    expect(await css(nav.getByRole("link", { name: "About" }), "opacity")).toBe("1");
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  });

  test("renders the masked wordmark (not a solid block, not empty)", async ({ page }) => {
    const shot = await page.getByRole("link", { name: "Chicago Mountain Runners" }).screenshot();
    const darkRatio = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let dark = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] < 128 * 3) dark++;
      return dark / (d.length / 4);
    }, shot.toString("base64"));
    // A failed mask renders ~100% black; a missing image ~0%.
    expect(darkRatio).toBeGreaterThan(0.35);
    expect(darkRatio).toBeLessThan(0.85);
  });

  test("keyboard focus shows the 3px MWDS ring (focus/ring = black in CMR)", async ({ page }) => {
    await page.keyboard.press("Tab"); // skip link
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Tab"); // logo
    await page.keyboard.press("Tab"); // first nav link
    const link = page.getByRole("navigation", { name: "Primary" }).getByRole("link").first();
    await expect(link).toBeFocused();
    expect(await css(link, "box-shadow")).toContain("rgb(0, 0, 0) 0px 0px 0px 3px");
  });

  test("has no axe violations (including color contrast)", async ({ page }) => {
    expect(await axe(page, "header")).toEqual([]);
  });
});

test.describe("footer", () => {
  test("uses the CMR accent surface and Figma typography", async ({ page }, info) => {
    const s = spec(info.project.name);
    const footer = page.locator("footer");
    expect(await css(footer, "background-color")).toBe("rgb(221, 255, 234)"); // cmr/mint/100
    expect(await css(footer, "color")).toBe("rgb(0, 0, 0)");
    expect(await css(footer, "border-top-width")).toBe(s.footerBorder ? "1px" : "0px");

    const heading = footer.getByRole("heading", { name: "Get the next run in your inbox." });
    expect(await css(heading, "font-size")).toBe(`${s.headingPx}px`);
    expect(await css(heading, "font-weight")).toBe("900");
  });

  test("newsletter form matches the MWDS instances", async ({ page }, info) => {
    const s = spec(info.project.name);
    const input = page.getByRole("textbox", { name: "Email address" });
    const button = page.getByRole("button", { name: "Join the list" });
    expect(Math.round((await box(input)).height)).toBe(s.formH);
    expect(Math.round((await box(button)).height)).toBe(s.formH);
    // "Join the list" hugs its label at MWDS Extra Large padding: 131px in Figma.
    expect(Math.abs((await box(button)).width - 131)).toBeLessThanOrEqual(3);
    expect(await css(button, "background-color")).toBe("rgb(0, 0, 0)"); // general/primary (CMR)
    expect(await css(button, "color")).toBe("rgb(255, 255, 255)");
    expect(await css(input, "border-color")).toBe("rgb(236, 236, 236)"); // general/border (CMR)
    expect(await css(input, "border-radius")).toBe("8px");
    if (info.project.name === "desktop") expect(Math.round((await box(input)).width)).toBe(309);
    if (info.project.name === "mobile") expect(Math.abs((await box(input)).width - 206)).toBeLessThanOrEqual(3);
  });

  test("is unavailable — not broken — until a provider is configured", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: "Email address" })).toBeDisabled();
    await expect(page.getByRole("status")).toHaveText("Newsletter signup isn’t open yet.");
  });

  test("has no axe violations (including color contrast)", async ({ page }) => {
    expect(await axe(page, "footer")).toEqual([]);
  });
});

test.describe("visual @visual", () => {
  test("header", async ({ page }) => {
    await expect(page.locator("header")).toHaveScreenshot("header.png");
  });
  test("footer", async ({ page }) => {
    await expect(page.locator("footer")).toHaveScreenshot("footer.png");
  });
});
