import { expect, test, type Locator, type Page } from "@playwright/test";

const AXE_PATH = require.resolve("axe-core");

// Figma measurements per frame (Home / Mobile 393, Tablet 768, Desktop), as
// revised in homepage Round 2 (Owner direction, 2026-11-08): links moved right
// beside the CTA (one row from tablet up; a right-aligned second row on mobile),
// and a 1px bottom rule that is transparent until the header turns compact
// (+1px on the expanded height). Logo and CTA sizes are Figma's.
// Desktop content is a 1400px container centred in the viewport, 48px padding.
const FIGMA = {
  mobile: { headerH: 137, logo: [24, 12, 100], cta: [259, 18, 110], linksY: 94, linkPx: 13, linkGap: 12, formH: 48, headingPx: 28 },
  tablet: { headerH: 100, logo: [48, 16, 128], cta: [592, 31, 128], linksY: 39, linkPx: 14, linkGap: 24, formH: 48, headingPx: 30 },
  desktop: { headerH: 123, logo: [68, 12, 188], cta: [1222, 43, 150], linksY: 51, linkPx: 14, linkGap: 36, formH: 44, headingPx: 30 },
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


/** WCAG relative luminance / contrast for "rgb(r, g, b)" computed colors. */
const lum = (rgb: string) => {
  const [r, g, b] = rgb.match(/\d+/g)!.slice(0, 3).map((v) => {
    const c = Number(v) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** Parses Chrome's computed box-shadow into the visible [{ color, spread }] ring layers (zero offset/blur). */
const rings = (shadow: string) =>
  [...shadow.matchAll(/(rgba?\([^)]+\)) 0px 0px 0px (\d+)px/g)]
    .map((m) => ({ color: m[1], spread: Number(m[2]) }))
    .filter((r) => r.spread > 0); // Tailwind always emits transparent zero-width placeholder layers

/**
 * The newsletter button is disabled until a provider is configured, so it can't
 * take focus in the shipped app. This enables it in the DOM (styling is what is
 * under test, not the form) and reaches it with a real Tab key press.
 */
async function tabToNewsletterButton(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll<HTMLInputElement | HTMLButtonElement>("footer form input, footer form button").forEach((el) => (el.disabled = false));
  });
  await page.getByRole("textbox", { name: "Email address" }).focus();
  await page.keyboard.press("Tab");
  const button = page.getByRole("button", { name: "Join the list" });
  await expect(button).toBeFocused();
  return button;
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

    const cta = await box(page.getByRole("banner").getByRole("link", { name: "Join the club" }));
    expect(Math.round(cta.width)).toBe(s.cta[2]);
    expect(Math.round(cta.height)).toBe(36);
    // Round 2.1: 1px border, matching the bar's 1px bottom rule.
    const ctaLink = page.getByRole("banner").getByRole("link", { name: "Join the club" });
    expect(await css(ctaLink, "border-top-width")).toBe("1px");
    expect(await css(ctaLink, "border-top-color")).toBe("rgb(0, 0, 0)");
    // Desktop: 1440 viewport → 1400 container + 48px padding puts the CTA's
    // right edge at 1372 (Figma: 48px inside the container edge).
    expect(Math.round(cta.x)).toBe(s.cta[0]);
    expect(Math.round(cta.y)).toBe(s.cta[1]);

    const nav = page.getByRole("navigation", { name: "Primary" });
    const first = nav.getByRole("link").first();
    expect(Math.round((await box(first)).y)).toBe(s.linksY);
    expect(await css(first, "font-size")).toBe(`${s.linkPx}px`);

    // Links sit on the right: the gap before the CTA equals the gap between links.
    const links = await box(nav);
    if (info.project.name === "mobile") {
      expect(Math.round(links.x + links.width)).toBe(Math.round(cta.x + cta.width)); // right-aligned under the CTA
    } else {
      expect(Math.round(cta.x - (links.x + links.width))).toBe(s.linkGap);
      const [a, b] = await nav.getByRole("link").all();
      expect(Math.round((await box(b)).x - ((await box(a)).x + (await box(a)).width))).toBe(s.linkGap);
      expect(links.x).toBeGreaterThan(logo.x + logo.width + 100);
    }
  });

  test("the Join the club CTA flips to black on hover and keeps a visible focus ring", async ({ page }, info) => {
    const cta = page.getByRole("banner").getByRole("link", { name: "Join the club" });
    expect(await css(cta, "background-color")).toBe("rgba(0, 0, 0, 0)");
    if (info.project.name === "desktop") {
      await cta.hover();
      await expect.poll(() => css(cta, "background-color")).toBe("rgb(0, 0, 0)");
      expect(await css(cta, "color")).toBe("rgb(255, 255, 255)");
      await page.mouse.move(5, 300);
    }
    await cta.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(cta).toBeFocused();
    const shadow = await css(cta, "box-shadow");
    expect(rings(shadow).map((r) => r.spread)).toEqual([2, 5]); // 2px gap + 3px ring
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
  test("uses the Round 2 quiet neutral surface, a tone-on-tone logo and Figma typography", async ({ page }, info) => {
    const s = spec(info.project.name);
    const footer = page.locator("footer");
    expect(await css(footer, "background-color")).toBe("rgb(245, 245, 245)"); // MWDS muted (neutrals 100)
    expect(await css(footer, "color")).toBe("rgb(64, 64, 64)"); // neutrals 700, 9.4:1 on the surface
    expect(contrast("rgb(64, 64, 64)", "rgb(245, 245, 245)")).toBeGreaterThanOrEqual(7);
    expect(await css(footer, "border-top-width")).toBe("1px");
    const logo = footer.getByRole("img", { name: "Chicago Mountain Runners" });
    await expect(logo).toBeVisible();
    expect((await box(logo)).y).toBeLessThan((await box(footer.getByRole("heading"))).y); // above the heading
    expect(Math.round((await box(logo)).x)).toBe(Math.round((await box(footer.getByRole("heading"))).x)); // left-aligned

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
    // Round 2: input border in the darker neutral (neutrals 500) so the field reads ≥ 3:1 on the gray surface.
    expect(await css(input, "border-color")).toBe("rgb(115, 115, 115)");
    expect(contrast("rgb(115, 115, 115)", "rgb(245, 245, 245)")).toBeGreaterThanOrEqual(3);
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

test.describe("focus indicators on solid black primary buttons", () => {
  test("gray footer: ring is offset from the fill and contrasts with it", async ({ page }) => {
    const button = await tabToNewsletterButton(page);
    expect(await css(button, "background-color")).toBe("rgb(0, 0, 0)");
    const [gap, ring] = rings(await css(button, "box-shadow"));
    expect(gap).toEqual({ color: "rgb(245, 245, 245)", spread: 2 }); // --muted (Round 2 footer surface)
    expect(ring).toEqual({ color: "rgb(0, 0, 0)", spread: 5 }); // 2px gap + 3px MWDS focus/ring
    expect(contrast(ring.color, gap.color)).toBeGreaterThanOrEqual(3); // WCAG 1.4.11 non-text contrast
    expect(contrast(gap.color, "rgb(0, 0, 0)")).toBeGreaterThanOrEqual(3); // gap separates ring from fill
  });

  test("white page background: gap follows the surface", async ({ page }) => {
    await tabToNewsletterButton(page);
    // Place a copy of the real button on the white page surface and tab to it.
    await page.evaluate(() => {
      const source = document.querySelector("footer form button")!;
      const before = document.createElement("button");
      before.id = "before-white";
      before.textContent = "before";
      const clone = source.cloneNode(true) as HTMLButtonElement;
      clone.id = "white-button";
      clone.type = "button";
      document.querySelector("main")!.append(before, clone);
    });
    await page.locator("#before-white").focus();
    await page.keyboard.press("Tab");
    const button = page.locator("#white-button");
    await expect(button).toBeFocused();
    const [gap, ring] = rings(await css(button, "box-shadow"));
    expect(gap).toEqual({ color: "rgb(255, 255, 255)", spread: 2 }); // --background
    expect(ring).toEqual({ color: "rgb(0, 0, 0)", spread: 5 });
    expect(contrast(ring.color, gap.color)).toBeGreaterThanOrEqual(3);
  });

  test("ring appears on keyboard focus and is removed on blur", async ({ page }) => {
    const button = await tabToNewsletterButton(page);
    expect(rings(await css(button, "box-shadow")).length).toBe(2);
    await page.keyboard.press("Shift+Tab");
    await expect(button).not.toBeFocused();
    expect(rings(await css(button, "box-shadow"))).toEqual([]);
  });

  test("the ring is not clipped: footer content clears the 5px ring", async ({ page }) => {
    const button = await tabToNewsletterButton(page);
    const b = await box(button);
    const form = await box(page.locator("footer form"));
    // The ring may extend beyond the button, but the footer (overflow visible) must not crop it.
    expect(await css(page.locator("footer"), "overflow")).toBe("visible");
    expect(b.x + b.width + 5).toBeLessThanOrEqual((await box(page.locator("footer"))).width);
    expect(form.height).toBeGreaterThan(0);
  });
});

test.describe("social links (none configured in this build)", () => {
  test("no placeholder or dead social links on any page", async ({ page }) => {
    for (const path of ["/about", "/join", "/"]) {
      await page.goto(path);
      const hrefs = await page.locator("a[href]").evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!));
      expect(hrefs.filter((h) => /instagram|strava|REPLACE_WITH/i.test(h)), path).toEqual([]);
      await expect(page.getByRole("link", { name: /^(Instagram|Strava)$/ })).toHaveCount(0);
    }
  });

  test("footer link row keeps its layout without social links", async ({ page }, info) => {
    const links = page.getByRole("navigation", { name: "Footer" }).getByRole("link");
    await expect(links).toHaveText(["Find a Run", "About", "Join the club"]);
    const first = await box(links.first());
    const last = await box(links.last());
    expect(Math.abs(first.y - last.y)).toBeLessThan(2); // still a single row
    expect(Math.round(first.x)).toBe(info.project.name === "mobile" ? 24 : info.project.name === "tablet" ? 48 : 68);
  });
});

test.describe("visual @visual", () => {
  test("header", async ({ page }) => {
    await expect(page.locator("header")).toHaveScreenshot("header.png");
  });
  test("footer", async ({ page }) => {
    await expect(page.locator("footer")).toHaveScreenshot("footer.png");
  });
  test("footer with keyboard focus on the primary button", async ({ page }) => {
    await tabToNewsletterButton(page);
    await expect(page.locator("footer form")).toHaveScreenshot("footer-button-focus.png");
  });
});
