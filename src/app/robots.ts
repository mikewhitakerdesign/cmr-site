import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Everything may be crawled. Pages that must not be indexed say so themselves (`robots: { index: false }`,
// e.g. legal documents that are still in review), and the sitemap leaves them out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
