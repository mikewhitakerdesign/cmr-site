// Outbound social destinations. There are deliberately NO default values:
// until real CMR accounts are supplied through configuration, no social link
// is rendered anywhere (footer, /join). Set in the environment at build time:
//
//   NEXT_PUBLIC_INSTAGRAM_URL   e.g. https://www.instagram.com/<handle>
//   NEXT_PUBLIC_STRAVA_URL      e.g. https://www.strava.com/clubs/<club>
//
// A value is accepted only if it is an absolute https URL on the platform's
// own domain. Anything else (empty, malformed, http, another host, or a
// leftover placeholder) counts as "not supplied" and the link is hidden
// rather than rendered broken.

export type SocialPlatform = "instagram" | "strava";

const HOSTS: Record<SocialPlatform, string> = {
  instagram: "instagram.com",
  strava: "strava.com",
};

/** Returns a normalized https URL for the platform, or null if the value isn't a genuine destination. */
export function resolveSocialLink(platform: SocialPlatform, value: string | undefined): string | null {
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  const expected = HOSTS[platform];
  if (host !== expected && !host.endsWith(`.${expected}`)) return null;
  // Needs a real path (an account/club), not just the site root.
  if (url.pathname.replace(/\//g, "") === "") return null;
  if (/replace[_-]?with|placeholder/i.test(url.pathname)) return null;
  return url.toString();
}

export type SocialLinks = Record<SocialPlatform, string | null>;

// NEXT_PUBLIC_* values are inlined at build time, so each must be referenced literally.
export const socialLinks: SocialLinks = {
  instagram: resolveSocialLink("instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  strava: resolveSocialLink("strava", process.env.NEXT_PUBLIC_STRAVA_URL),
};
