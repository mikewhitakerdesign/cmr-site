import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionNav } from "@/components/SectionNav";
import { FAQ_INTRO, FAQ_TITLE, faq } from "@/content/faq";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { BODY_TEXT_COLOR, DISPLAY_HEADING, displayHeading } from "@/lib/headings";
import { cn } from "@/lib/utils";

const LABEL = "font-mono text-[13px] leading-5 tracking-[0.1em] uppercase";
const FOCUS = "rounded-xs outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * The FAQ page body: label, title, intro, a row of in-page category links, then
 * four categories of native <details> disclosures. No JavaScript: each question
 * is a heading inside its <summary>, so it is keyboard- and screen-reader
 * operable and every answer is in the document for reading and find-in-page.
 */
export function Faq() {
  return (
    <>
      <section aria-labelledby="faq-heading" className="border-b border-foreground py-14 md:py-20">
        <Container>
          <h1 id="faq-heading" style={fluidType([52, 96, 130], [50, 90, 120])} className={cn(FLUID_TYPE, "font-black tracking-[-0.045em] text-balance")}>
            {FAQ_TITLE}
          </h1>
          <p className={cn("mt-6 max-w-[62ch] text-[18px] leading-[27px]", BODY_TEXT_COLOR)}>{FAQ_INTRO}</p>
        </Container>
      </section>

      <div data-slot="faq-body">
        <SectionNav sections={faq.map((c) => ({ id: c.id, label: c.title }))} label="FAQ categories" slot="faq-nav" />
        {faq.map((c) => (
        <section key={c.id} id={c.id} aria-labelledby={`${c.id}-heading`} className="border-b border-foreground/30 py-12 md:py-16">
          <Container className="grid gap-8 md:gap-10">
            <h2 id={`${c.id}-heading`} style={displayHeading()} className={cn(FLUID_TYPE, DISPLAY_HEADING, "text-balance")}>
              <span aria-hidden className={cn(LABEL, "mb-3 block text-foreground/75")}>
                {c.number}
              </span>
              {c.title}
              <span className="ss08">.</span>
            </h2>
            <div className="max-w-[860px] border-t border-foreground/30">
              {c.items.map((item) => (
                <details key={item.q} className="group border-b border-foreground/30">
                  <summary className={cn(FOCUS, "flex cursor-pointer list-none items-start justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden")}>
                    <h3 className="text-[20px] leading-[28px] font-semibold">{item.q}</h3>
                    <svg aria-hidden viewBox="0 0 16 16" className="mt-1.5 size-4 shrink-0 transition-transform group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                      <path d="M8 3v10M3 8h10" />
                    </svg>
                  </summary>
                  <div className="pb-6">
                    <p className="max-w-[62ch] text-[18px] leading-[27px]">{item.a}</p>
                    {item.more && (
                      <Link href={item.more.href} className={cn(FOCUS, "mt-3 inline-block text-p font-medium underline underline-offset-4")}>
                        {item.more.label}
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </Container>
        </section>
        ))}
      </div>
    </>
  );
}
