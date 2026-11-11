import { expect, test } from "@playwright/test";

/**
 * Canonical URLs, robots.txt and the sitemap, observed on the built site
 * (.aiom/work/configure-cmr-custom-domains.md). The origin is a constant
 * (src/lib/site.ts), so these hold on localhost exactly as in production.
 * Viewport does not matter, so only the desktop project runs them.
 */
const ORIGIN = "https://www.chicagomountainrunners.com";

test.beforeEach(() => {
  test.skip(test.info().project.name !== "desktop", "viewport-independent");
});

const CANONICAL: Array<[string, string]> = [
  ["/", ORIGIN],
  ["/about", `${ORIGIN}/about`],
  ["/calendar", `${ORIGIN}/calendar`],
  ["/hills", `${ORIGIN}/hills`],
  ["/hills/cricket-hill", `${ORIGIN}/hills/cricket-hill`],
  ["/the-science", `${ORIGIN}/the-science`],
  ["/join", `${ORIGIN}/join`],
  ["/faq", `${ORIGIN}/faq`],
  ["/privacy", `${ORIGIN}/privacy`],
  ["/terms", `${ORIGIN}/terms`],
  ["/participation-guidelines", `${ORIGIN}/participation-guidelines`],
  // Query strings never become part of the canonical.
  ["/join?utm_source=newsletter", `${ORIGIN}/join`],
  ["/hills/cricket-hill?ref=x", `${ORIGIN}/hills/cricket-hill`],
];

for (const [path, canonical] of CANONICAL) {
  test(`canonical for ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    // Indexable pages carry no robots meta at all.
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });
}

test("the participant waiver stays out of the site (404, noindex)", async ({ page }) => {
  const res = await page.goto("/participant-waiver");
  expect(res?.status()).toBe(404);
  // Next emits the not-found noindex and the page's own; both say the same thing.
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
});

test("robots.txt allows crawling and names the canonical sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/User-Agent: \*\s+Allow: \//i);
  expect(body).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
});

test("sitemap.xml lists only canonical-host URLs, and each is a live page", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs.length).toBeGreaterThan(10);
  for (const loc of locs) {
    expect(loc.startsWith(ORIGIN)).toBe(true);
    // Fetch the same path from the local server: every listed URL must exist.
    const page = await request.get(loc.slice(ORIGIN.length) || "/");
    expect(page.status(), loc).toBe(200);
  }
});
