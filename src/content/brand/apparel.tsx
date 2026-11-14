import type { CSSProperties, ReactNode } from "react";
import { BrandBadge } from "@/components/brand/BrandBadge";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { PlacementLab } from "@/components/brand/demos/PlacementLab";
import { Pending, Rule, Source, SpecTable, StatusTag } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_GROW, PRINT_ONLY, PRINT_ROWS_2, WEB_ONLY } from "@/components/brand/styles";
import { Tee } from "@/components/brand/Tee";
import { HillContourArt } from "@/components/hills/HillContourArt";
import { TopoPattern } from "@/components/home/TopoPattern";
import type { BrandChapter } from "@/lib/brand/manual";
import { tintVars } from "@/lib/tints";
import { cn } from "@/lib/utils";

/** An artwork concept: real CMR artwork arranged for an object, always labeled as a concept. */
function Concept({ name, note, children, className }: { name: string; note: string; children: ReactNode; className?: string }) {
  return (
    <figure className="flex min-h-0 flex-col">
      <div className={cn("relative isolate flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl [.brand-print_&]:aspect-auto [.brand-print_&]:min-h-0 [.brand-print_&]:flex-1", className)}>
        {children}
        <span className={cn(LABEL, "absolute top-3 left-3 rounded-xs bg-background px-1.5 py-0.5 text-[10px] text-foreground ring-1 ring-foreground/30")}>Concept</span>
      </div>
      <figcaption className="mt-3">
        <span className="block text-p-sm font-semibold">{name}</span>
        <span className="block text-[13px] leading-[18px] text-foreground/65">{note}</span>
      </figcaption>
    </figure>
  );
}

const Ready = ({ children }: { children: ReactNode }) => <span className="font-semibold">{children}</span>;
const No = ({ children }: { children: ReactNode }) => <span className="text-foreground/60">{children}</span>;

export const apparel: BrandChapter = {
  slug: "apparel",
  number: "09",
  title: "Apparel and objects.",
  name: "Apparel",
  summary: "Direction for shirts, bandanas, stickers and signs that do not exist yet. Everything here is a proposal built from real CMR artwork, and none of it is a production file.",
  plates: [
    {
      id: "status",
      title: "Nothing is approved yet.",
      nav: "Status",
      status: "unresolved",
      lede: "CMR has no production merchandise, no vendor and no approved garment artwork. This chapter is here so the first run starts from the brand and not from a blank template. Read every page of it as a proposal.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="flex flex-col justify-between rounded-xl bg-primary p-8 text-primary-foreground lg:col-span-5">
            <p className={cn(LABEL, "text-primary-foreground/70")}>Approved production items</p>
            <p className="text-[clamp(160px,24vw,300px)] leading-[0.8] font-black tracking-[-0.06em] [.brand-print_&]:text-[300px]">0</p>
            <p className="max-w-[30ch] text-p text-primary-foreground/85">Which is the right number to have before the artwork masters and the rules exist.</p>
          </div>
          <div className="flex flex-col lg:col-span-7">
            <SpecTable
              caption="What exists and does not exist for CMR merchandise"
              head={["Exists today", "Does not exist yet"]}
              rows={[
                ["The badge and wordmark, as described in Marks.", "A vector badge approved for production."],
                ["Three expressions: Hills on Repeat, Hills on Hills, Get High in the City.", "Any approved garment graphic, front or back."],
                ["The contour pattern, as vector paths.", "A repeat-ready pattern file for bandanas or gaiters."],
                ["Five hill profile drawings, as vector art.", "A print master for tie-dye or the gradient."],
                ["The palette, in sRGB.", "Matched ink, thread or fabric colors."],
                ["This guidance.", "A vendor, a proof, a size run, a price."],
              ]}
            />
            <h3 className={cn(LABEL, "mt-8 mb-3 text-foreground/65")}>Under consideration (from the Owner&apos;s brief)</h3>
            <ul className="flex flex-wrap gap-2">
              {["Color-blast shirts", "Small chest logos", "Large back graphics", "Contour bandanas", "Neck gaiters", "Hats", "Microfiber towels", "Stickers", "Welcome kits", "Event signage"].map((x) => (
                <li key={x} className="rounded-md border border-dashed border-foreground/50 px-2.5 py-1 text-p-sm">
                  {x}
                </li>
              ))}
            </ul>
            <Pending status="proposed" title="How a vendor should read this chapter." className={cn("mt-8", PRINT_BOTTOM)}>
              Nothing shown is artwork to print from. Production files, sizes and colors are issued separately by the Owner, per item, after a proof.
            </Pending>
          </div>
        </div>
      ),
    },
    {
      id: "artwork",
      title: "Artwork readiness.",
      nav: "Artwork",
      status: "proposed",
      lede: "Whether a piece of CMR artwork can go to a vendor today depends on its master file and on the process. This is a planning table, not a vendor's verdict: confirm each cell with whoever is making the item.",
      render: () => (
        <>
          <SpecTable
            caption="Readiness of each CMR artwork for common production methods"
            head={["Artwork", "Master today", "Screen print", "Heat transfer", "Embroidery", "All-over print"]}
            rows={[
              ["Badge", "Raster; proposed vector awaiting approval", <No key="a">After vector approval</No>, <No key="b">After vector approval</No>, <No key="c">After approval; ™ may not hold</No>, "Not intended"],
              ["Wordmark", "Traced vector; live type in Figma", <Ready key="a">Likely ready, one color</Ready>, <Ready key="b">Likely ready</Ready>, "Large sizes only", "Not intended"],
              ["Expressions, as type", "Geist Black, outlined per job", <Ready key="a">Likely ready, one color</Ready>, <Ready key="b">Likely ready</Ready>, "Large sizes only", "Possible"],
              ["Contour pattern", "Vector, hairline strokes", "Needs a heavier line", "Needs a heavier line", <No key="c">Unsuitable as hairlines</No>, "Needs a seamless repeat"],
              ["Hill profiles", "Vector, black line", "Possible at large size", "Possible at large size", <No key="c">Too fine</No>, "Possible"],
              ["Tie-dye", "None (screen effect only)", <No key="a">No master</No>, <No key="b">No master</No>, <No key="c">Not applicable</No>, <No key="d">Needs artwork and a proof</No>],
              ["Hill silhouette", "Raster only", <No key="a">Needs a vector</No>, <No key="b">Needs a vector</No>, <No key="c">Needs a vector</No>, "Not intended"],
            ]}
          />
          <div className={cn("mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="Vector for anything with an edge.">Marks and type go to vendors as outlined vector files. Raster is for photographs and soft color only.</Rule>
            <Rule title="One color is the default.">The marks are one-color by design. A second ink has to earn its place and its cost.</Rule>
            <Rule title="Hairlines do not survive thread.">The 1 px contour line is a screen idea. On fabric it needs to be redrawn heavier, as its own approved artwork.</Rule>
          </div>
          <Source className="mt-6">Master files: Marks, “Files, and what is missing.” Method notes are general production practice, unverified with any vendor.</Source>
        </>
      ),
    },
    {
      id: "placement",
      title: "Placement.",
      nav: "Placement",
      status: "proposed",
      lede: "Three zones cover almost every shirt the club is likely to make: a small mark on the chest, the name across the upper back, and one large graphic below it. The diagrams use the real marks on a generic outline.",
      render: () => (
        <>
          <div className={WEB_ONLY}>
            <PlacementLab />
          </div>
          <div className={cn("grid-cols-3 gap-6 rounded-xl bg-muted p-8", PRINT_ONLY, "[.brand-print_&]:grid", PRINT_GROW, "[.brand-print_&]:items-center")}>
            <Tee view="front" art="badge-chest" caption="Front. Zone A: badge, left chest." className="@container" />
            <Tee view="back" ground="black" art="wordmark-back" caption="Back. Zone B: wordmark, upper back." className="@container" />
            <Tee view="back" ground="tie-dye" art="expression-back" caption="Back. Zone C: one expression, large." className="@container" />
          </div>
          <div className={cn("mt-8 grid gap-8 lg:grid-cols-12", PRINT_BOTTOM)}>
            <div className="lg:col-span-7">
              <SpecTable
                caption="Proposed apparel placement zones"
                head={["Zone", "Carries", "Notes"]}
                rows={[
                  ["A. Left chest", "The badge, alone.", "Small, with its full clear space. The primary mark's natural home."],
                  ["B. Upper back", "The wordmark, or nothing.", "Below the collar seam. Never with the badge on the same side."],
                  ["C. Back, large", "One expression or one graphic.", "Type in Geist Black, a hill profile, or a contour field. Not all three."],
                ]}
              />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-5">
              <Pending status="unresolved" title="No dimensions are specified.">
                Print sizes, distances from seams and maximum areas vary by garment, size run and vendor. Set them at proof and record them per item.
              </Pending>
              <p className="flex items-start gap-3 text-p-sm text-foreground/75">
                <StatusTag status="proposed" className="mt-0.5" />
                The shirt outline is a diagram. It is not a product, a mockup or a size specification.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "methods",
      title: "Methods.",
      nav: "Methods",
      status: "proposed",
      lede: "What each way of putting artwork on an object tends to ask of that artwork. These are the questions to bring to a vendor, written from general practice. The vendor's answers replace them.",
      render: () => (
        <>
          <SpecTable
            caption="Production methods and what to confirm with a vendor for each"
            head={["Method", "Suits", "Ask the vendor", "Brand watch-out"]}
            rows={[
              ["Screen printing", "The marks and expressions in one flat color.", "Smallest printable line and counter; ink type; how black prints on a dark or dyed shirt.", "The knocked-out letters of the badge must stay open."],
              ["Heat transfer", "Short runs; small chest marks.", "Edge quality at small size; hand feel; wash durability.", "No visible carrier or outline around the badge's irregular edge."],
              ["Embroidery", "Hats; a chest badge at generous size.", "Minimum letter height; whether the ™ can be stitched or should be dropped for this item.", "Dropping the ™ is a change to the mark and needs Owner approval."],
              ["Direct-to-garment or sublimation", "Full-color and all-over work: tie-dye, gradient, contour fields.", "Color range on the chosen fabric; file resolution; how the pale tints reproduce.", "The tints are very pale. A proof on the real fabric is the only test."],
              ["Die-cut stickers", "The badge; the wordmark.", "Minimum border; cut tolerance around an irregular shape; finish.", "Cut follows the badge's own outline, with an even margin. No circle."],
              ["Large-format signage", "Wordmark, expressions, arrows, hill names.", "File format and scale; outdoor durability; mounting.", "Black on white or white on black. Legible from a distance beats decorated."],
            ]}
          />
          <div className={cn("mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="Color shifts by substrate.">The same ink reads differently on cotton, polyester, paper and vinyl. Approve color on the material, never on a screen.</Rule>
            <Rule title="Black is not automatic.">A “black” shirt, a black ink and the brand&apos;s screen black are three different blacks. Decide which one leads.</Rule>
            <Rule title="Ask about washing.">Durability claims belong to the vendor and the proof, not to this manual. Record what they tell you.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "objects",
      title: "Objects.",
      nav: "Objects",
      status: "proposed",
      lede: "Six sketches of how existing CMR artwork could sit on the things in the Owner's list. Each panel is flat artwork made from the real marks, patterns and type. None is a product design.",
      render: () => (
        <div className={cn("grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3", PRINT_GROW, PRINT_ROWS_2)}>
          <Concept name="Bandana" note="The contour pattern edge to edge, one color, with the badge in a corner." className="border border-foreground/15 bg-background">
            <TopoPattern className="-z-10 text-foreground/55" />
            <div className="absolute right-[6%] bottom-[8%] w-[20%] bg-background p-[1.5%]">
              <BrandBadge className="w-full" decorative />
            </div>
          </Concept>
          <Concept name="Neck gaiter" note="The same pattern reversed, white line on black, as a continuous band." className="bg-primary text-primary-foreground">
            <TopoPattern className="-z-10 text-(--cmr-quiet-edge)" />
            <p className="text-[clamp(18px,3vw,34px)] leading-none font-black tracking-[-0.045em]">HILLS ON REPEAT.</p>
          </Concept>
          <Concept name="Sticker" note="The badge, die-cut to its own outline. No circle, no square." className="bg-muted">
            <div className="w-[52%]">
              <BrandBadge className="w-full" decorative />
            </div>
          </Concept>
          <Concept name="Hill patch or print" note="One hill's contour drawing with its name in mono. A set of five." className="border border-foreground/15 bg-background">
            <div className="flex w-[46%] flex-col items-center">
              <HillContourArt slug="cricket-hill" className="w-full" />
              <p className={cn(LABEL, "mt-2 text-[10px]")}>Cricket Hill · ≈ 30 ft</p>
            </div>
          </Concept>
          <Concept name="Welcome card" note="A tie-dye circle, one line, and the wordmark. The About page on paper." className="border border-foreground/15 bg-background">
            <div className="flex w-[78%] items-center justify-between gap-4">
              <div style={tintVars(0) as CSSProperties} className="relative isolate flex aspect-square w-[42%] items-center justify-center overflow-hidden rounded-full px-[5%] text-center">
                <span aria-hidden className="cmr-tie-dye absolute -z-10" />
                <span className="text-[clamp(9px,1.4vw,14px)] leading-[1.15] font-extrabold">Show up, run the hill, repeat.</span>
              </div>
              <BrandWordmark className="w-[46%]" />
            </div>
          </Concept>
          <Concept name="Course sign" note="A line the site already uses, an arrow and nothing else. Readable at a jog." className="bg-primary text-primary-foreground">
            <p className="text-center text-[clamp(26px,4.4vw,52px)] leading-[0.9] font-black tracking-[-0.045em]">
              SEE YOU ON
              <br />
              THE HILL ↑
            </p>
          </Concept>
        </div>
      ),
    },
    {
      id: "proof",
      title: "Before anything ships.",
      nav: "Proofing",
      status: "proposed",
      lede: "A short list to run for every item, every time. It exists because the first physical object will set expectations for all the ones after it.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <ol className="lg:col-span-7">
            {(
              [
                ["The Owner has approved the artwork for this item.", "Not a similar item, and not last season's version."],
                ["The file is the approved master, unaltered.", "Vector for marks and type, with fonts outlined. Nothing redrawn by the vendor."],
                ["A physical proof exists, on the real material.", "Screens lie about color, and paper lies about fabric."],
                ["The mark is intact at the produced size.", "Letters open, ™ legible or its removal approved, clear space respected."],
                ["Color was approved on the proof.", "Recorded as what the vendor used: ink, thread or profile, by name."],
                ["Every claim on the item is true.", "No “official,” “est.” or member language the club cannot stand behind."],
                ["The result is recorded.", "Vendor, method, sizes, colors and a photograph of the proof, filed with the item."],
              ] as const
            ).map(([q, a], i) => (
              <li key={q} className="grid grid-cols-[2rem_1.5rem_1fr] items-start gap-x-3 border-t border-foreground py-3.5 [.brand-print_&]:py-3">
                <span className="font-mono text-[13px] leading-6 text-foreground/65">{String(i + 1).padStart(2, "0")}</span>
                <span aria-hidden className="mt-0.5 size-5 rounded-xs border border-foreground" />
                <div>
                  <p className="text-[18px] leading-6 font-black tracking-[-0.02em]">{q}</p>
                  <p className="mt-0.5 text-p-sm text-foreground/70">{a}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-6 lg:col-span-5">
            <Rule title="Concept, proof, production.">Three separate states. A concept in this manual is not a proof, and a proof is not permission to run.</Rule>
            <Rule title="Keep the first of everything.">One sample from each run is the reference for the next. It is the only color standard the club will have for a while.</Rule>
            <Rule title="When in doubt, simpler.">One mark, one color, plenty of room. The brand reads best when the object is quiet and the idea is not.</Rule>
            <Pending status="unresolved" title="No vendor specifications are recorded." className={PRINT_BOTTOM}>
              No vendor has been selected or consulted. Tolerances, minimums, pricing and durability results will be added here only once they are real.
            </Pending>
          </div>
        </div>
      ),
    },
  ],
};
