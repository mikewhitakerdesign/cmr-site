import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Brand Standards (/brand and its nine chapters) at 393 / 768 / 1440: every
 * route loads on its own, the one sticky row sits under the site header and
 * carries the chapter menu, this page's sections and Download PDF; anchors
 * clear the bar; the PDF is a real downloadable file; the print route is not
 * public; the interactive demonstrations work; and every page passes axe
 * (including contrast) with no sideways scrolling.
 */
const AXE_PATH = require.resolve("axe-core");
async function axe(page: Page) {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] });
    return r.violations.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  });
}

const CHAPTERS = [
  ["premise", "The premise."],
  ["marks", "The marks."],
  ["color", "Color."],
  ["typography", "Typography."],
  ["graphic-language", "Graphic language."],
  ["photography", "Photography."],
  ["voice", "Voice."],
  ["digital", "Digital."],
  ["governance", "Governance."],
] as const;
const ROUTES = ["/brand", ...CHAPTERS.map(([slug]) => `/brand/${slug}`)];
const PDF = "/downloads/cmr-brand-standards.pdf";

const box = async (l: Locator) => (await l.boundingBox())!;
const noHScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const brandNav = (page: Page) => page.getByRole("navigation", { name: "Brand Standards" });
const barBottom = (page: Page) => page.evaluate(() => document.querySelector("body > header [data-slot=header-bar]")!.getBoundingClientRect().bottom);
const isDesktop = () => test.info().project.name === "desktop";

/** Wait until scrolling (smooth or not) has stopped, and the header has finished resizing. */
async function settle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = -1;
        let still = 0;
        const tick = () => {
          const y = window.scrollY;
          still = y === last ? still + 1 : 0;
          last = y;
          if (still >= 8) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      }),
  );
  await page.waitForTimeout(500);
}

test.describe("routes", () => {
  test("the landing page has its title, version, no hero buttons, six essentials, nine chapters and the two status tags", async ({ page }) => {
    const res = await page.goto("/brand");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle("Brand Standards | Chicago Mountain Runners");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Brand\s*standards\./);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("[data-slot=brand-hero]")).toContainText(/Version 1\.0 · Release candidate/);
    await expect(page.locator("[data-slot=brand-hero] a, [data-slot=brand-hero] button")).toHaveCount(0);
    await expect(page.locator("#essentials li")).toHaveCount(6);
    const rows = page.locator("#chapters ol > li a");
    await expect(rows).toHaveCount(9);
    expect(await rows.evaluateAll((els) => els.map((e) => e.getAttribute("href")))).toEqual(CHAPTERS.map(([slug]) => `/brand/${slug}`));
    for (const s of ["provisional", "pending"]) await expect(page.locator(`#how-to-read [data-status=${s}]`)).toHaveCount(1);
  });

  for (const [slug, title] of CHAPTERS) {
    test(`/brand/${slug} loads directly with its own h1, plates and pager`, async ({ page }) => {
      const res = await page.goto(`/brand/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      const plates = page.locator("section[data-slot=brand-plate]");
      expect(await plates.count()).toBeGreaterThanOrEqual(5);
      // The opener's list and the sticky row both name every plate, in order.
      const ids = await plates.evaluateAll((els) => els.map((e) => `#${e.id}`));
      expect(await page.getByRole("navigation", { name: "In this chapter" }).getByRole("link").evaluateAll((els) => els.map((e) => e.getAttribute("href")))).toEqual(ids);
      expect(await brandNav(page).locator("[data-slot=brand-nav-scroller] a").evaluateAll((els) => els.map((e) => e.getAttribute("href")))).toEqual(ids);
      await expect(page.getByRole("navigation", { name: "Chapters" }).getByRole("link")).toHaveCount(2);
      // Every image on the page really loaded.
      await page.evaluate(async () => {
        for (const img of document.images) {
          img.loading = "eager";
          if (!img.complete) await new Promise((r) => ((img.onload = r), (img.onerror = r)));
        }
      });
      expect(await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.currentSrc || i.src))).toEqual([]);
    });
  }

  test("an unknown chapter is a 404, and so is the deferred Apparel chapter", async ({ page }) => {
    expect((await page.goto("/brand/not-a-chapter"))?.status()).toBe(404);
    expect((await page.goto("/brand/apparel"))?.status()).toBe(404);
  });

  test("the footer's secondary row ends with Brand Standards on every kind of page, and the main row does not repeat it", async ({ page }) => {
    for (const path of ["/", "/the-science", "/brand/color"]) {
      await page.goto(path);
      const row = page.getByRole("list", { name: "Legal" }).getByRole("link");
      await expect(row.last()).toHaveText("Brand Standards");
      await expect(row.last()).toHaveAttribute("href", "/brand");
      expect(await row.allTextContents()).toEqual(expect.arrayContaining(["Participation Guidelines", "Brand Standards"]));
      const texts = await row.allTextContents();
      expect(texts.indexOf("Brand Standards")).toBe(texts.indexOf("Participation Guidelines") + 1);
      await expect(page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "Brand Standards" })).toHaveCount(0);
    }
  });
});

test.describe("layout and accessibility", () => {
  for (const route of ROUTES) {
    test(`${route} has no sideways scroll and no axe violations`, async ({ page }) => {
      await page.goto(route);
      expect(await noHScroll(page)).toBe(true);
      expect(await axe(page)).toEqual([]);
      // Still true at the bottom of the page (wide tables scroll inside themselves).
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      expect(await noHScroll(page)).toBe(true);
    });
  }

  test("wide specification tables scroll inside themselves and are keyboard reachable", async ({ page }) => {
    await page.goto("/brand/governance");
    const table = page.locator("#assets [data-slot=brand-table]");
    await expect(table).toHaveAttribute("tabindex", "0");
    await expect(table).toHaveAttribute("role", "group");
    const overflow = await table.evaluate((el) => getComputedStyle(el).overflowX);
    expect(overflow).toBe("auto");
  });
});

test.describe("the sticky row", () => {
  test("sits directly under the site header while a chapter scrolls, and releases before the footer", async ({ page }) => {
    await page.goto("/brand/color");
    const nav = brandNav(page);
    await page.locator("#secondary").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 400));
    await settle(page);
    const b = await box(nav);
    expect(Math.abs(b.y - (await barBottom(page)))).toBeLessThanOrEqual(2);
    expect(b.width).toBeGreaterThan(300);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await settle(page);
    // At the very bottom the row has scrolled away with its chapter: it is not over the footer.
    const footerTop = (await box(page.locator("body > footer"))).y;
    const navBox = await nav.boundingBox();
    expect(navBox === null || navBox.y + navBox.height <= footerTop + 1).toBe(true);
  });

  test("a fragment URL lands with the section's heading clear of the header and the row", async ({ page }) => {
    await page.goto("/brand/color#pairings");
    await settle(page);
    const heading = page.locator("#pairings-heading");
    await expect(heading).toBeInViewport();
    const navBottom = await brandNav(page).evaluate((el) => el.getBoundingClientRect().bottom);
    expect((await box(heading)).y).toBeGreaterThanOrEqual(navBottom);
  });

  test("clicking a section link scrolls to it and marks it current", async ({ page }) => {
    await page.goto("/brand/typography");
    const link = brandNav(page).getByRole("link", { name: "Text roles", exact: true });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await settle(page);
    await expect(page).toHaveURL(/\/brand\/typography#text$/);
    await expect(link).toHaveAttribute("aria-current", "location");
    await expect(brandNav(page).locator("[aria-current=location]")).toHaveCount(1);
    const navBottom = await brandNav(page).evaluate((el) => el.getBoundingClientRect().bottom);
    expect((await box(page.locator("#text-heading"))).y).toBeGreaterThanOrEqual(navBottom);
  });

  test("the chapter menu opens under the row, moves between chapters, and closes with Escape", async ({ page }) => {
    await page.goto("/brand/marks");
    const nav = brandNav(page);
    const button = nav.getByRole("button", { name: /Chapters/ });
    const panel = page.locator("[data-slot=brand-chapter-panel]");
    await expect(panel).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    await settle(page); // opening may scroll the row up to the header (below)
    // The panel hangs from the row, full width, and stays on screen.
    const [n, p] = [await box(nav), await box(panel)];
    expect(Math.abs(p.y - (n.y + n.height))).toBeLessThanOrEqual(2);
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x + p.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    await expect(panel.getByRole("link")).toHaveCount(10);
    await expect(panel.locator("[aria-current=page]")).toHaveText(/02\s*Marks/);

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(button).toBeFocused();

    await button.click();
    await panel.getByRole("link", { name: /Typography/ }).click();
    await expect(page).toHaveURL(/\/brand\/typography$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Typography.");
    // A new page starts with the menu closed and its own sections in the row.
    await expect(page.locator("[data-slot=brand-chapter-panel]")).toBeHidden();
    await expect(brandNav(page).getByRole("link", { name: "Display roles", exact: true })).toBeVisible();
  });

  test("opening the chapter menu from the top of a page brings its panel into view", async ({ page }) => {
    await page.goto("/brand");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await brandNav(page).getByRole("button", { name: /Chapters/ }).click();
    // On a phone the row starts below the fold; the panel must not be left off screen.
    await settle(page);
    await expect(page.locator("[data-slot=brand-chapter-panel] a").first()).toBeInViewport({ ratio: 1 });
    await expect(page.locator("[data-slot=brand-chapter-panel] a").last()).toBeInViewport({ ratio: 1 });
  });

  test("is fully usable from the keyboard: menu, sections, then the PDF", async ({ page }) => {
    await page.goto("/brand/voice");
    const nav = brandNav(page);
    const button = nav.getByRole("button", { name: /Chapters/ });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-slot=brand-chapter-panel]")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator("[data-slot=brand-chapter-panel] a").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
    // With the menu closed, Tab goes straight to the first section link.
    await page.keyboard.press("Tab");
    await expect(nav.locator("[data-slot=brand-nav-scroller] a").first()).toBeFocused();
    const pdf = nav.locator("[data-slot=brand-pdf-link]");
    await pdf.focus();
    await expect(pdf).toBeFocused();
    const ring = await pdf.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(ring).not.toBe("none");
  });

  test("the row fits the viewport at every width: menu left, PDF right, sections between", async ({ page }) => {
    await page.goto("/brand/graphic-language");
    const nav = brandNav(page);
    const width = page.viewportSize()!.width;
    const [menu, scroller, pdf] = [await box(nav.getByRole("button", { name: /Chapters/ })), await box(nav.locator("[data-slot=brand-nav-scroller]")), await box(nav.locator("[data-slot=brand-pdf-link]"))];
    expect(menu.x).toBeGreaterThanOrEqual(0);
    expect(pdf.x + pdf.width).toBeLessThanOrEqual(width + 1);
    expect(menu.x + menu.width).toBeLessThanOrEqual(scroller.x + 1);
    expect(scroller.x + scroller.width).toBeLessThanOrEqual(pdf.x + 1);
    // Enough room is left for the sections to be usable.
    expect(scroller.width).toBeGreaterThan(120);
    expect(Math.abs(menu.y - pdf.y)).toBeLessThanOrEqual(1);
  });
});

test.describe("Download PDF", () => {
  test("is in the sticky row on the landing page and on a chapter, and downloads the complete manual", async ({ page }) => {
    for (const route of ["/brand", "/brand/governance"]) {
      await page.goto(route);
      const link = brandNav(page).locator("[data-slot=brand-pdf-link]");
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", PDF);
      await expect(link).toHaveAccessibleName(/Download PDF, the complete manual, version \d+\.\d+/);
      const [download] = await Promise.all([page.waitForEvent("download"), link.click()]);
      expect(download.suggestedFilename()).toBe("CMR-Brand-Standards-v1.0-RC.pdf");
      expect(await download.failure()).toBeNull();
    }
  });

  test("the file is a real PDF of substantial size", async ({ request }) => {
    test.skip(!isDesktop(), "viewport-independent");
    const res = await request.get(PDF);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
    const body = await res.body();
    expect(body.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(body.length).toBeGreaterThan(1_000_000);
  });
});

test.describe("print route", () => {
  test.beforeEach(() => test.skip(!isDesktop(), "the print route has one fixed layout"));

  test("is reachable for building the PDF but is noindex, self-contained and not in the sitemap", async ({ page, request }) => {
    const res = await page.goto("/brand/print");
    expect(res?.status()).toBe(200);
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain("brand/print");
    // The site chrome is not part of the manual.
    await expect(page.locator("body > header")).toBeHidden();
    await expect(page.locator("body > footer")).toBeHidden();
    await expect(page.locator("[data-slot=brand-nav]")).toHaveCount(0);
  });

  test("lays out exactly the declared pages at the page size, with folios in order", async ({ page }) => {
    await page.goto("/brand/print");
    await page.emulateMedia({ media: "print" });
    const report = await page.evaluate(() => {
      const root = document.querySelector("[data-slot=brand-print]")!;
      const pages = [...document.querySelectorAll("[data-slot=brand-page]")];
      return {
        declared: Number(root.getAttribute("data-pages")),
        sizes: [...new Set(pages.map((p) => `${p.getBoundingClientRect().width}x${p.getBoundingClientRect().height}`))],
        folios: pages.map((p) => Number(p.getAttribute("data-page"))),
      };
    });
    expect(report.folios).toHaveLength(report.declared);
    expect(report.folios).toEqual(report.folios.map((_, i) => i + 1));
    expect(report.sizes).toEqual(["1320x1020"]);
    expect(report.declared).toBeGreaterThanOrEqual(60);
  });
});

test.describe("interactive demonstrations", () => {
  test("Color: a swatch copies its HEX and the contrast checker recomputes", async ({ page, context }) => {
    test.skip(!isDesktop(), "clipboard permissions are granted on the desktop project only");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/brand/color");
    const swatch = page.locator("#secondary [data-slot=brand-swatch][data-hex='#ddffea']").first();
    await swatch.scrollIntoViewIfNeeded();
    await swatch.click();
    await expect(swatch.getByRole("status")).toHaveText("Copied #ddffea");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("#ddffea");
    // The swatch is painted with the token itself and matches the value it prints.
    expect(await swatch.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(221, 255, 234)");

    const checker = page.locator("[data-slot=contrast-checker]");
    await checker.getByLabel("Background").selectOption("accent");
    await expect(checker.locator("[data-slot=contrast-ratio]")).toHaveText("19.56:1");
    await checker.getByLabel("Text").selectOption("white");
    await expect(checker.locator("[data-slot=contrast-ratio]")).toHaveText("1.07:1");
    await expect(checker.locator("[data-slot=contrast-grade]")).toHaveText("Fail");
  });

  test("Color: every swatch's printed HEX is the color actually painted", async ({ page }) => {
    test.skip(!isDesktop(), "viewport-independent");
    await page.goto("/brand/color");
    const mismatches = await page.locator("[data-slot=brand-swatch]").evaluateAll((els) =>
      els
        .map((el) => {
          const [r, g, b] = getComputedStyle(el).backgroundColor.match(/\d+/g)!.map(Number);
          const painted = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
          return { printed: el.getAttribute("data-hex"), painted };
        })
        .filter((s) => s.printed !== s.painted),
    );
    expect(mismatches).toEqual([]);
  });

  test("Marks: the badge stage switches ground and hides its clear space", async ({ page }) => {
    await page.goto("/brand/marks#space");
    const stage = page.locator("[data-slot=logo-stage]");
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toContainText("x = letter height");
    await stage.getByRole("button", { name: "Black" }).click();
    await expect(stage.getByRole("button", { name: "Black" })).toHaveAttribute("aria-pressed", "true");
    await stage.getByRole("button", { name: "Hide" }).click();
    await expect(stage).not.toContainText("x = letter height");
    await stage.getByLabel("Width").fill("96");
    await expect(stage).toContainText("96px wide");
  });

  test("Typography: the type tester reports the fluid size at a chosen viewport", async ({ page }) => {
    await page.goto("/brand/typography#display");
    const tester = page.locator("[data-slot=type-tester]");
    await tester.scrollIntoViewIfNeeded();
    await tester.getByRole("button", { name: /Display XL/ }).click();
    await expect(tester.locator("[data-slot=type-tester-size]")).toHaveText("209 / 204 px");
    await tester.getByLabel("Viewport").fill("393");
    await expect(tester.locator("[data-slot=type-tester-size]")).toHaveText("48 / 52 px");
    await tester.getByLabel("Viewport").fill("768");
    await expect(tester.locator("[data-slot=type-tester-size]")).toHaveText("98 / 102 px");
  });

  test("Graphic language: the contour field switches settings; Photography: the gradient slider moves", async ({ page }) => {
    await page.goto("/brand/graphic-language#contours");
    const lab = page.locator("[data-slot=contour-lab]");
    await lab.scrollIntoViewIfNeeded();
    await expect(lab).toContainText("scale 940 · levels 4.5");
    await lab.getByRole("button", { name: "Flat is a state of mind" }).click();
    await expect(lab).toContainText("scale 460 · levels 10");
    await expect(lab).toContainText("FLAT IS A STATE OF MIND.");

    await page.goto("/brand/photography#treatment");
    const gradient = page.locator("[data-slot=gradient-lab]");
    await gradient.scrollIntoViewIfNeeded();
    await expect(gradient).toContainText("Gradient 25% · in production");
    await gradient.getByLabel("Gradient opacity").fill("35");
    await expect(gradient).toContainText("Gradient 35% · not in use");
    await gradient.getByRole("button", { name: /Just show up 50%/ }).click();
    await expect(gradient).toContainText("Gradient 50% · in production");
  });

  test("Voice: the headline checker scores live, and offers no warrior talk as a starter", async ({ page }) => {
    await page.goto("/brand/voice#drafts");
    const check = page.locator("[data-slot=headline-check]");
    await check.scrollIntoViewIfNeeded();
    await expect(check.locator("[data-slot=headline-score]")).toHaveText("5 of 5");
    await check.getByLabel("Your headline").fill("Join Us For An Epic Journey!");
    await expect(check.locator("[data-slot=headline-score]")).toHaveText("1 of 5");
    await expect(check).not.toContainText(/warrior/i);
  });

  test("Marks: every logo file downloads as the real file, and the ZIP is a ZIP", async ({ page, request }) => {
    test.skip(!isDesktop(), "viewport-independent");
    await page.goto("/brand/marks#files");
    const links = page.locator("#files").getByRole("link", { name: /^Download the .* as (SVG|PNG)$/ });
    await expect(links).toHaveCount(8);
    for (const link of await links.all()) {
      const href = (await link.getAttribute("href"))!;
      const res = await request.get(href);
      expect(res.status(), href).toBe(200);
      const body = await res.body();
      if (href.endsWith(".svg")) {
        expect(res.headers()["content-type"]).toContain("image/svg+xml");
        expect(body.toString("utf8")).toMatch(/^<!--[^>]*-->\n<svg [^>]*viewBox="0 0 [\d.]+ [\d.]+"/);
        expect(body.toString("utf8")).not.toMatch(/<image/i);
      } else {
        expect(res.headers()["content-type"]).toContain("image/png");
        expect(body.subarray(1, 4).toString("latin1")).toBe("PNG");
      }
    }
    // A real browser download, with the file's own name.
    const [download] = await Promise.all([page.waitForEvent("download"), links.first().click()]);
    expect(download.suggestedFilename()).toBe("cmr-badge-black.svg");
    const zipLink = page.getByRole("link", { name: "Download all logo files (ZIP)" });
    const zip = await request.get((await zipLink.getAttribute("href"))!);
    expect(zip.headers()["content-type"]).toContain("zip");
    expect((await zip.body()).readUInt32LE(0)).toBe(0x04034b50);
  });

  test("the site icon is served in every format the head declares", async ({ page, request }) => {
    test.skip(!isDesktop(), "viewport-independent");
    await page.goto("/");
    const hrefs = await page.locator('head link[rel="icon"], head link[rel="apple-touch-icon"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
    expect(hrefs.map((h) => h.split("?")[0]).sort()).toEqual(["/apple-icon.png", "/favicon.ico", "/icon.svg"]);
    for (const h of hrefs) expect((await request.get(h)).status(), h).toBe(200);
  });

  test("Digital: the motion control is the site's own and pauses decorative motion", async ({ page }) => {
    await page.goto("/brand/digital#motion");
    const toggle = page.locator("#motion [data-slot=motion-toggle]");
    await toggle.scrollIntoViewIfNeeded();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    // The footer's control reflects the same state.
    await expect(page.locator("footer [data-slot=motion-toggle]")).toHaveAttribute("data-motion-state", "off");
  });
});

test.describe("honesty", () => {
  test("Apparel is deferred: not in the chapter list, the chapter menu, the sitemap or the PDF's source", async ({ page, request }) => {
    test.skip(!isDesktop(), "viewport-independent");
    await page.goto("/brand");
    await expect(page.locator("#chapters")).not.toContainText("Apparel");
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain("brand/apparel");
    await page.goto("/brand/print");
    await expect(page.locator('[data-slot=brand-page][aria-label^="Chapter"]')).toHaveCount(9);
    await expect(page.locator('[data-slot=brand-page][aria-label*="Apparel"]')).toHaveCount(0);
  });

  test("the unreproduced photograph is not on the Photography page", async ({ page }) => {
    test.skip(!isDesktop(), "viewport-independent");
    await page.goto("/brand/photography");
    expect(await page.locator("img").evaluateAll((els) => els.map((e) => (e as HTMLImageElement).currentSrc + (e as HTMLImageElement).src).filter((s) => /hardik/i.test(s)))).toEqual([]);
    await expect(page.locator("#library")).toContainText("Not reproduced here");
  });
});
