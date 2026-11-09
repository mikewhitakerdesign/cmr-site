import type { ReactNode } from "react";

/** One word of a heading in the pale tie-dye fill (`cmr-tie-dye-text`, src/styles/cmr.css). Keeps the word in the text for readers. */
export function TieDyeWord({ children }: { children: ReactNode }) {
  return <span className="cmr-tie-dye-text">{children}</span>;
}
