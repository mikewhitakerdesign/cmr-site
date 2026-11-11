import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { hillsWithPages } from "@/lib/hills";
import { sitemapPaths } from "@/lib/sitemap-paths";
import { SITE_ORIGIN, absoluteUrl } from "@/lib/site";

const APP = join(__dirname, "..", "..", "src", "app");

function pageFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return pageFiles(full);
    return name === "page.tsx" ? [full] : [];
  });
}

describe("production origin (src/lib/site.ts)", () => {
  it("is the canonical www host: https, no trailing slash, not an apex or secondary domain", () => {
    expect(SITE_ORIGIN).toBe("https://www.chicagomountainrunners.com");
    expect(new URL(SITE_ORIGIN).pathname).toBe("/");
    expect(SITE_ORIGIN.endsWith("/")).toBe(false);
  });

  it("builds absolute URLs: the root is the bare origin and other paths have no trailing slash", () => {
    expect(absoluteUrl("/")).toBe("https://www.chicagomountainrunners.com");
    expect(absoluteUrl()).toBe("https://www.chicagomountainrunners.com");
    expect(absoluteUrl("/about")).toBe("https://www.chicagomountainrunners.com/about");
    expect(absoluteUrl("hills/cricket-hill")).toBe("https://www.chicagomountainrunners.com/hills/cricket-hill");
  });
});

describe("robots.txt", () => {
  it("allows crawling and names the canonical absolute sitemap", () => {
    const r = robots();
    expect(r.rules).toEqual([{ userAgent: "*", allow: "/" }]);
    expect(r.sitemap).toBe("https://www.chicagomountainrunners.com/sitemap.xml");
  });
});

describe("sitemap.xml", () => {
  const urls = sitemap().map((e) => e.url);

  it("lists only absolute URLs on the canonical host, once each, without trailing slashes or queries", () => {
    expect(new Set(urls).size).toBe(urls.length);
    for (const u of urls) {
      const url = new URL(u);
      expect(url.origin).toBe(SITE_ORIGIN);
      expect(url.search).toBe("");
      expect(url.hash).toBe("");
      expect(u.endsWith("/")).toBe(false);
    }
  });

  it("includes the home page, the primary routes and every hill detail page", () => {
    expect(urls).toContain(SITE_ORIGIN);
    for (const p of ["/about", "/calendar", "/hills", "/the-science", "/join", "/faq"]) expect(urls).toContain(`${SITE_ORIGIN}${p}`);
    for (const h of hillsWithPages()) expect(urls).toContain(`${SITE_ORIGIN}/hills/${h.slug}`);
  });

  it("never lists the participant waiver, the ICS downloads or the placeholder scaffold", () => {
    for (const u of urls) {
      expect(u).not.toMatch(/participant-waiver|\/ics|example-hill/);
    }
  });

  it("leaves out a legal document that is still in review, and every run page while runs are on hold", () => {
    const base = { hills: [], runs: [{ slug: "a-run", content: {} }] };
    const held = sitemapPaths({ ...base, held: true, legal: { privacy: null, terms: {}, guidelines: null } });
    expect(held).not.toContain("/privacy");
    expect(held).toContain("/terms");
    expect(held).not.toContain("/participation-guidelines");
    expect(held.some((p) => p.startsWith("/calendar/"))).toBe(false);

    const open = sitemapPaths({ ...base, held: false, legal: { privacy: {}, terms: {}, guidelines: {} } });
    expect(open).toContain("/calendar/a-run");
    expect(open).toEqual(expect.arrayContaining(["/privacy", "/terms", "/participation-guidelines"]));
  });

  it("omits a run that has no content (its page 404s)", () => {
    expect(sitemapPaths({ held: false, hills: [], runs: [{ slug: "empty" }] })).not.toContain("/calendar/empty");
  });
});

describe("canonical URLs", () => {
  it("every page declares a self-referencing canonical", () => {
    const missing = pageFiles(APP)
      .filter((f) => !/alternates:\s*\{\s*canonical:/.test(readFileSync(f, "utf8")))
      .map((f) => relative(APP, f));
    expect(missing).toEqual([]);
  });

  it("the root layout sets metadataBase from the one origin and no canonical of its own", () => {
    const layout = readFileSync(join(APP, "layout.tsx"), "utf8");
    expect(layout).toMatch(/metadataBase:\s*new URL\(SITE_ORIGIN\)/);
    expect(layout).not.toMatch(/alternates\s*:/);
  });

  it("no production host is hard-coded in the app outside src/lib/site.ts", () => {
    const hits = readdirSync(join(APP, ".."), { recursive: true })
      .map(String)
      .filter((f) => /\.(ts|tsx)$/.test(f) && f !== join("lib", "site.ts"))
      .filter((f) => /chicagomountainrunners\.com|hillsonhills\.com/.test(readFileSync(join(APP, "..", f), "utf8")));
    expect(hits).toEqual([]);
  });
});
