import { Container } from "@/components/Container";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { BODY_TEXT_COLOR } from "@/lib/headings";
import type { LegalDoc } from "@/content/legal";
import { HERO_TOP, heroTopVars } from "@/lib/hero-spacing";
import { cn } from "@/lib/utils";

/**
 * A legal or policy page: a plain, readable single column. Long-form text,
 * so no display type below the title and no decoration. With `doc === null`
 * it shows only that the document is in review; it never shows policy text.
 */
export function LegalDocument({ title, doc }: { title: string; doc: LegalDoc | null }) {
  return (
    <Container style={heroTopVars()} className={cn(HERO_TOP, "pb-14 md:pb-24")}>
      <article className="max-w-[720px]" aria-labelledby="legal-title">
        <h1 id="legal-title" style={fluidType([44, 64, 88], [44, 64, 84])} className={cn(FLUID_TYPE, "font-black tracking-[-0.04em] text-balance")}>
          {title}
        </h1>
        {doc ? (
          <>
            <p className={cn("mt-4 font-mono text-[13px] leading-5 tracking-[0.1em] uppercase", BODY_TEXT_COLOR)}>
              {doc.dateLabel ?? "Last updated"} {doc.updated}
              {doc.version && <> · Version {doc.version}</>}
            </p>
            {doc.draftNote && (
              <p data-slot="legal-draft-note" className="mt-6 rounded-lg border border-foreground p-4 text-[16px] leading-6 font-medium">
                {doc.draftNote}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-4 text-[18px] leading-[27px]">
              {doc.intro?.map((p) => <p key={p}>{p}</p>)}
            </div>
            {doc.sections.map((s) => (
              <section key={s.heading} aria-labelledby={`h-${s.heading.replace(/\W+/g, "-").toLowerCase()}`} className="mt-10">
                <h2 id={`h-${s.heading.replace(/\W+/g, "-").toLowerCase()}`} className="text-h4 font-semibold">
                  {s.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-4 text-[18px] leading-[27px]">
                  {s.paragraphs.map((p) =>
                    typeof p === "string" ? (
                      <p key={p}>{p}</p>
                    ) : (
                      <h3 key={p.h3} className="mt-2 text-[20px] leading-[28px] font-semibold">
                        {p.h3}
                      </h3>
                    ),
                  )}
                </div>
              </section>
            ))}
          </>
        ) : (
          <p data-slot="legal-in-review" className={cn("mt-6 text-[20px] leading-[30px]", BODY_TEXT_COLOR)}>
            This page isn&apos;t published yet. It&apos;s being reviewed and will appear here when it&apos;s final.
          </p>
        )}
      </article>
    </Container>
  );
}
