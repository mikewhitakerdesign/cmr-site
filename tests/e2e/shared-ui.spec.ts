import { expect, test, type Locator, type Page } from "@playwright/test";

const AXE_PATH = require.resolve("axe-core");

// Figma measurements per frame (Home / Mobile 393, Tablet 768, Desktop), as
// revised in homepage Round 2 (Owner direction, 2026-11-08): links moved right
// beside the CTA (one row from tablet up; a right-aligned second row on mobile),
// and a 1px bottom rule that is transparent until the header turns compact
// (+1px on the expanded height). Logo and CTA sizes are Figma's.
// Desktop content is a 1400px container centred in the viewport, 48px padding.
const FIGMA = {
  // Mobile: PR #4 final refinements (64px top row, 1px rule, 48px link cells at 15px).
  mobile: { headerH: 114, logo: [24, 6, 100], cta: [259, 14, 110], linksY: 65, linkPx: 15, linkGap: 12, formH: 48, headingPx: 28 },
  // Tablet link gap 24 → 16 when The Science became the fourth link (2026-11-09), so the row fits at 768.
  tablet: { headerH: 100, logo: [48, 16, 128], cta: [592, 31, 128], linksY: 39, linkPx: 14, linkGap: 16, formH: 48, headingPx: 30 },
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
/** Any computed CSS color (rgb(), color(srgb …) from color-mix, …) as "rgb(r, g, b)". */
const toRgb = (page: Page, color: string) =>
  page.evaluate((c) => {
    const x = document.createElement("canvas").getContext("2d")!;
    x.fillStyle = c;
    x.fillRect(0, 0, 1, 1);
    const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  }, color);
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

    const logo = await box(page.getByRole("link", { name: "Chicago Mountain Runners", exact: true }));
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
      // The link row spans the viewport under a 1px rule; each link is its whole cell, ≥ 44px tall.
      expect(Math.round(links.x)).toBe(0);
      expect(Math.round(links.width)).toBe(393);
      expect(await css(nav, "border-top-width")).toBe("1px");
      const cells = await nav.getByRole("link").evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, w: r.width, h: r.height })));
      for (const c of cells) expect(c.h).toBeGreaterThanOrEqual(44);
      expect(Math.round(cells.reduce((sum, c) => sum + c.w, 0))).toBe(393);
      expect(Math.round(cells[0].x)).toBe(0);
    } else {
      expect(Math.round(cta.x - (links.x + links.width))).toBe(s.linkGap);
      const [a, b] = await nav.getByRole("link").all();
      expect(Math.round((await box(b)).x - ((await box(a)).x + (await box(a)).width))).toBe(s.linkGap);
      // Links sit on the right. With four links (The Science, 2026-11-09) the tablet bar is full at 768,
      // so there the open space after the logo only has to exceed the item gap; desktop keeps 100px+.
      expect(links.x).toBeGreaterThan(logo.x + logo.width + (info.project.name === "tablet" ? s.linkGap : 100));
    }
  });

  test("the Join the club CTA flips to black on hover and keeps a visible focus ring", async ({ page }, info) => {
    const cta = page.getByRole("banner").getByRole("link", { name: "Join the club" });
    expect(await css(cta, "background-color")).toBe("rgb(255, 255, 255)"); // pure white at rest (final refinements)
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
    expect(await css(nav.getByRole("link", { name: "Hills on Repeat" }), "opacity")).toBe("0.8");
    expect(await css(nav.getByRole("link", { name: "About" }), "opacity")).toBe("1");
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  });

  test("renders the masked wordmark (not a solid block, not empty)", async ({ page }) => {
    const shot = await page.getByRole("link", { name: "Chicago Mountain Runners", exact: true }).screenshot();
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

test.describe("mobile header scrolling (PR #4 final refinements)", () => {
  test("scrolling down hides the top row and pins the link row; scrolling up brings it back; nothing jumps", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "mobile only");
    await page.goto("/hills/cricket-hill");
    await page.evaluate(() => document.fonts.ready);
    const header = page.locator("body > header");
    const bar = header.locator("[data-slot=header-bar]");
    const nav = page.getByRole("navigation", { name: "Primary" });
    const cta = header.getByRole("link", { name: "Join the club" });
    const headerH = (await box(header)).height;
    // Real scrolling: wheel steps down.
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 80);
      await page.waitForTimeout(40);
    }
    await expect(header).toHaveAttribute("data-hide-top", "");
    await expect.poll(async () => Math.round((await box(nav)).y)).toBe(0); // link row pinned at the top
    expect((await box(cta)).y + (await box(cta)).height).toBeLessThanOrEqual(0); // top row out of view
    expect((await box(header)).height).toBe(headerH); // layout box unchanged: no content shift
    // The pinned row's links still work as full-height cells.
    for (const l of await nav.getByRole("link").all()) expect((await box(l)).height).toBeGreaterThanOrEqual(44);
    // Up a little: the top row returns, without moving the page.
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, -60);
    await page.waitForTimeout(40);
    await page.mouse.wheel(0, -60);
    await expect(header).not.toHaveAttribute("data-hide-top", "");
    await expect.poll(async () => Math.round((await box(bar)).y)).toBe(0);
    const after = await page.evaluate(() => window.scrollY);
    expect(before - after).toBeLessThanOrEqual(130); // only what we scrolled; no jump
    // Keyboard: focus on the CTA while hidden brings the row back.
    for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 120);
    await expect(header).toHaveAttribute("data-hide-top", "");
    await cta.focus();
    await expect(header).not.toHaveAttribute("data-hide-top", "");
  });

  test("tablet and desktop never hide the top row", async ({ page }, info) => {
    test.skip(info.project.name === "mobile", "tablet and desktop");
    await page.goto("/hills/cricket-hill");
    for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 120);
    await page.waitForTimeout(300);
    await expect(page.locator("body > header")).not.toHaveAttribute("data-hide-top", "");
    expect(Math.round((await box(page.locator("[data-slot=header-bar]"))).y)).toBe(0);
  });

  test("reduced motion: the top row hides without a slide", async ({ browser }, info) => {
    test.skip(info.project.name !== "mobile", "mobile only");
    const page = await browser.newPage({ reducedMotion: "reduce", viewport: { width: 393, height: 852 } });
    await page.goto("/hills/cricket-hill");
    expect(await css(page.locator("[data-slot=header-bar]"), "transition-property")).not.toMatch(/transform/);
    await page.close();
  });
});

test.describe("footer", () => {
  test("uses the Round 2 quiet neutral surface, the tone-on-tone wordmark and Figma typography", async ({ page }, info) => {
    const s = spec(info.project.name);
    const footer = page.locator("footer");
    expect(await css(footer, "background-color")).toBe("rgb(245, 245, 245)"); // MWDS muted (neutrals 100)
    // PR #4 final pass: a couple of shades lighter than neutrals 700 (#404040, 9.4:1) and only
    // just accessible: 80% neutrals 500 + 20% neutrals 600 ≈ #6c6c6c, 4.8:1 on the surface.
    const ink = await toRgb(page, await css(footer, "color"));
    expect(ink).toBe("rgb(108, 108, 108)");
    const ratio = contrast(ink, "rgb(245, 245, 245)");
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(ratio).toBeLessThan(5.5);
    expect(await css(footer, "border-top-width")).toBe("1px");
    // Refinement pass (Owner direction, 2026-11-08): one large wordmark, in the footer ink,
    // in the right half beside the newsletter (below it on mobile). The small badge is gone.
    const mark = footer.locator("[data-slot=cmr-wordmark]");
    // The wordmark is the "back to top" link's content (PR #4 final refinements).
    await expect(footer.getByRole("link", { name: "Chicago Mountain Runners, back to top" })).toHaveCount(1);
    await expect(mark).toBeVisible();
    expect(await toRgb(page, await css(mark, "background-color"))).toBe(ink);
    const m = await box(mark);
    expect(m.width / m.height).toBeCloseTo(1858 / 888, 1);
    // The newsletter block is hidden for v1 (Owner, 2026-11-09), so the wordmark sits left, at the container edge.
    await expect(footer.locator("form")).toHaveCount(0);
    await expect(footer.getByRole("heading", { name: "Get the next run in your inbox." })).toHaveCount(0);
    const inner = await box(footer.locator(":scope > div"));
    const padLeft = parseFloat(await css(footer.locator(":scope > div"), "padding-left"));
    // FAQ and footer refinements: the wordmark is left-aligned in the upper area at every size.
    expect(Math.abs(m.x - (inner.x + padLeft))).toBeLessThanOrEqual(1);
    void s;
  });

  test.skip("newsletter form matches the MWDS instances (block hidden for v1)", async ({ page }, info) => {
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

  test.skip("is unavailable — not broken — until a provider is configured", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: "Email address" })).toBeDisabled();
    await expect(page.getByRole("status")).toHaveText("Newsletter signup isn’t open yet.");
  });

  test("the wordmark is a link back to the top of the page: smooth, then focus at the top", async ({ page }) => {
    await page.goto("/hills/cricket-hill");
    const link = page.locator("footer").getByRole("link", { name: "Chicago Mountain Runners, back to top" });
    await expect(link).toHaveAttribute("href", "#top");
    await link.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
    await link.click();
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 4000 }).toBe(0);
    expect(page.url()).not.toContain("#top");
    // Keyboard users continue from the top: focus is on the skip link.
    await expect(page.getByRole("link", { name: /skip/i })).toBeFocused();
    // The wordmark keeps its look: the footer ink, the traced proportions.
    const mark = link.locator("[data-slot=cmr-wordmark]");
    const m = await box(mark);
    expect(m.width / m.height).toBeCloseTo(1858 / 888, 1);
  });

  test("the back-to-top link jumps instantly under reduced motion", async ({ browser }) => {
    const page = await browser.newPage({ reducedMotion: "reduce" });
    await page.goto("/hills/cricket-hill");
    const link = page.locator("footer").getByRole("link", { name: "Chicago Mountain Runners, back to top" });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.close();
  });

  test("has no axe violations (including color contrast)", async ({ page }) => {
    expect(await axe(page, "footer")).toEqual([]);
  });
});

test.describe("focus indicators on solid black primary buttons", () => {
  test.skip("gray footer: ring is offset from the fill and contrasts with it", async ({ page }) => {
    const button = await tabToNewsletterButton(page);
    expect(await css(button, "background-color")).toBe("rgb(0, 0, 0)");
    const [gap, ring] = rings(await css(button, "box-shadow"));
    expect(gap).toEqual({ color: "rgb(245, 245, 245)", spread: 2 }); // --muted (Round 2 footer surface)
    expect(ring).toEqual({ color: "rgb(0, 0, 0)", spread: 5 }); // 2px gap + 3px MWDS focus/ring
    expect(contrast(ring.color, gap.color)).toBeGreaterThanOrEqual(3); // WCAG 1.4.11 non-text contrast
    expect(contrast(gap.color, "rgb(0, 0, 0)")).toBeGreaterThanOrEqual(3); // gap separates ring from fill
  });

  test.skip("white page background: gap follows the surface", async ({ page }) => {
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

  test.skip("ring appears on keyboard focus and is removed on blur", async ({ page }) => {
    const button = await tabToNewsletterButton(page);
    expect(rings(await css(button, "box-shadow")).length).toBe(2);
    await page.keyboard.press("Shift+Tab");
    await expect(button).not.toBeFocused();
    expect(rings(await css(button, "box-shadow"))).toEqual([]);
  });

  test.skip("the ring is not clipped: footer content clears the 5px ring", async ({ page }) => {
    const button = await tabToNewsletterButton(page);
    const b = await box(button);
    const form = await box(page.locator("footer form"));
    // The ring may extend beyond the button, but the footer (overflow visible) must not crop it.
    expect(await css(page.locator("footer"), "overflow")).toBe("visible");
    expect(b.x + b.width + 5).toBeLessThanOrEqual((await box(page.locator("footer"))).width);
    expect(form.height).toBeGreaterThan(0);
  });
});

test.describe("focus indicators on the Join submit button (solid black primary, white page)", () => {
  test("ring is offset by the page color and appears only on keyboard focus", async ({ page }) => {
    await page.goto("/join");
    const button = page.locator("#join").getByRole("button", { name: "Join the club" });
    // The Privacy Policy link sits between the age box and the button; tab from it.
    await page.locator("#join").getByRole("link", { name: "Privacy Policy" }).focus();
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    expect(await css(button, "background-color")).toBe("rgb(0, 0, 0)");
    const [gap, ring] = rings(await css(button, "box-shadow"));
    expect(gap).toEqual({ color: "rgb(255, 255, 255)", spread: 2 });
    expect(ring).toEqual({ color: "rgb(0, 0, 0)", spread: 5 });
    expect(contrast(ring.color, gap.color)).toBeGreaterThanOrEqual(3);
    await page.keyboard.press("Shift+Tab");
    await expect(button).not.toBeFocused();
    expect(rings(await css(button, "box-shadow"))).toEqual([]);
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

  test("footer Navigate list: vertical, in order, with Pause motion in the lower area", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Footer" });
    await expect(nav.getByText("Navigate", { exact: true })).toBeVisible();
    const links = nav.getByRole("link"); // the visible copy only
    await expect(links).toHaveText(["Hills on Repeat", "Hills on Hills", "The Science", "About", "FAQ", "Join the club"]);
    const boxes = [];
    for (let i = 0; i < 5; i++) boxes.push(await box(links.nth(i)));
    for (let i = 1; i < 5; i++) {
      expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y + boxes[i - 1].height - 1); // stacked
      expect(Math.abs(boxes[i].x - boxes[0].x)).toBeLessThan(2); // left-aligned with each other
    }
    const pause = await box(page.locator("footer").getByRole("button", { name: /Pause motion|Resume motion/ }));
    expect(pause.y).toBeGreaterThan(boxes[4].y); // lower area, below the divider
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
