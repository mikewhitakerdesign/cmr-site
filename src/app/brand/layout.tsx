import type { ReactNode } from "react";
import "@/styles/brand.css";

/** Brand Standards (/brand, its chapters and the print route): loads the section's stylesheet, nothing else. */
export default function BrandLayout({ children }: { children: ReactNode }) {
  return children;
}
