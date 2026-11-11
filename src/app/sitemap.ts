import type { MetadataRoute } from "next";
import { sitemapPaths } from "@/lib/sitemap-paths";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapPaths().map((path) => ({ url: absoluteUrl(path) }));
}
