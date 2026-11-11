import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildFooterNav } from "@/lib/navigation";
import { resolveSocialLink } from "@/lib/social";

describe("resolveSocialLink", () => {
  it.each([
    ["instagram", "https://www.instagram.com/chicagomountainrunners", "https://www.instagram.com/chicagomountainrunners"],
    ["instagram", "https://instagram.com/cmr", "https://instagram.com/cmr"],
    ["instagram", "  https://instagram.com/cmr  ", "https://instagram.com/cmr"],
    ["strava", "https://www.strava.com/clubs/cmr", "https://www.strava.com/clubs/cmr"],
  ] as const)("accepts %s %s", (platform, input, expected) => {
    expect(resolveSocialLink(platform, input)).toBe(expected);
  });

  it.each([
    ["instagram", undefined],
    ["instagram", ""],
    ["instagram", "   "],
    ["instagram", "not a url"],
    ["instagram", "http://instagram.com/cmr"], // not https
    ["instagram", "https://instagram.com"], // no account
    ["instagram", "https://instagram.com/"],
    ["instagram", "https://example.com/cmr"], // wrong host
    ["instagram", "https://notinstagram.com/cmr"], // look-alike host
    ["instagram", "https://instagram.com.evil.example/cmr"],
    ["instagram", "javascript:alert(1)"],
    ["instagram", "https://instagram.com/REPLACE_WITH_CMR_INSTAGRAM_HANDLE"], // the old placeholder
    ["strava", "https://www.strava.com/clubs/REPLACE_WITH_CMR_STRAVA_CLUB"], // the old placeholder
    ["strava", "https://www.instagram.com/cmr"], // wrong platform
  ] as const)("rejects %s %j", (platform, input) => {
    expect(resolveSocialLink(platform, input)).toBeNull();
  });
});

describe("buildFooterNav", () => {
  it("has no social items when none are supplied", () => {
    expect(buildFooterNav({ instagram: null, strava: null }).map((i) => i.href)).toEqual(["/calendar", "/hills", "/the-science", "/about", "/faq", "/join"]);
  });

  it("includes only the platforms that are supplied", () => {
    const nav = buildFooterNav({ instagram: null, strava: "https://www.strava.com/clubs/cmr" });
    expect(nav.map((i) => i.label)).toEqual(["Hills on Repeat", "Hills on Hills", "The Science", "About", "FAQ", "Join the club", "Strava"]);
    expect(nav.at(-1)).toMatchObject({ href: "https://www.strava.com/clubs/cmr", external: true });
  });
});

describe("environment configuration reaches the footer nav", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("renders no social links when unconfigured", async () => {
    const { footerNav } = await import("@/lib/navigation");
    expect(footerNav.map((i) => i.label)).toEqual(["Hills on Repeat", "Hills on Hills", "The Science", "About", "FAQ", "Join the club"]);
  });

  it("renders configured links in the footer nav", async () => {
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_URL", "https://www.instagram.com/cmr");
    vi.stubEnv("NEXT_PUBLIC_STRAVA_URL", "https://www.strava.com/clubs/cmr");
    vi.resetModules();
    const { footerNav } = await import("@/lib/navigation");
    expect(footerNav.map((i) => i.label)).toEqual(["Hills on Repeat", "Hills on Hills", "The Science", "About", "FAQ", "Join the club", "Instagram", "Strava"]);
  });

  it("ignores a configured value that isn't a genuine destination", async () => {
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_URL", "https://instagram.com/REPLACE_WITH_CMR_INSTAGRAM_HANDLE");
    vi.resetModules();
    const { footerNav } = await import("@/lib/navigation");
    expect(footerNav.map((i) => i.label)).not.toContain("Instagram");
  });

  it("the Join page carries no social links; its only links are the waiver and the Privacy Policy", async () => {
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_URL", "https://www.instagram.com/cmr");
    vi.resetModules();
    const { default: JoinPage } = await import("@/app/join/page");
    render(<JoinPage />);
    expect(screen.getAllByRole("link").map((a) => a.textContent)).toEqual(["Participant Waiver and Assumption of Risk", "Privacy Policy"]);
  });
});
