import { ScienceSection } from "@/components/science/editorial";
import { SCIENCE_SOURCES, shortCitation, sourceAnchor } from "@/content/science-sources";
import { cn } from "@/lib/utils";

const LINK =
  "rounded-xs font-medium text-foreground underline decoration-foreground/30 underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring";

/**
 * 09 · Sources. Numbered in order of first citation, each with a stable
 * anchor (`#source-<id>`) the inline citations link to. Vancouver-style
 * entries; links to the DOI, PubMed and PubMed Central where they exist.
 */
export function Sources() {
  return (
    <ScienceSection id="sources" heading="Sources">
      <ol data-slot="source-list" className="flex max-w-[900px] flex-col border-b border-foreground/15">
        {SCIENCE_SOURCES.map((s, i) => {
          const who = shortCitation(s);
          return (
            <li
              key={s.id}
              id={sourceAnchor(s.id)}
              className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 border-t border-foreground/15 py-5 target:bg-muted md:grid-cols-[48px_minmax(0,1fr)] md:gap-4"
            >
              <span className="font-mono text-[14px] leading-[26px] text-foreground/65 tabular-nums">{i + 1}.</span>
              <div>
                <p className="font-mono text-[12px] leading-5 tracking-[0.08em] text-foreground/65 uppercase">
                  {s.topic} · {s.design}
                </p>
                <p className="mt-1 text-[16px] leading-[26px] text-foreground/85">
                  {s.authors.endsWith(".") ? s.authors : `${s.authors}.`} <span className="text-foreground">{s.title}.</span> <i>{s.journal}</i>. {s.year};{s.locator}.
                </p>
                <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-p-sm [overflow-wrap:anywhere]">
                  <a href={`https://doi.org/${s.doi}`} rel="noopener noreferrer" className={LINK}>
                    doi:{s.doi}
                    <span className="sr-only">, {who} (external site)</span>
                  </a>
                  {s.pmid && (
                    <a href={`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`} rel="noopener noreferrer" className={LINK}>
                      PubMed
                      <span className="sr-only">: {who} (external site)</span>
                    </a>
                  )}
                  {s.pmcid && (
                    <a href={`https://pmc.ncbi.nlm.nih.gov/articles/${s.pmcid}/`} rel="noopener noreferrer" className={LINK}>
                      Full text (PMC)
                      <span className="sr-only">: {who} (external site)</span>
                    </a>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p data-slot="science-disclaimer" className={cn("mt-10 max-w-[680px] text-p-sm text-muted-foreground")}>
        This page is general educational information, not medical advice or an individual training plan. Research findings
        describe groups of people under study conditions and may not apply to you. If you have a health condition, an injury
        or symptoms during exercise, talk to a qualified professional before changing how you train.
      </p>
    </ScienceSection>
  );
}
